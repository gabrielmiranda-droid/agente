from __future__ import annotations

import asyncio

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import ExternalServiceError, IntegrationConfigurationError, NotFoundError
from app.core.logging_config import get_logger
from app.integrations.evolution_client import EvolutionClient
from app.integrations.openai_client import OpenAIClient
from app.models.auth import User
from app.repositories.ai_repository import AIAgentRepository
from app.repositories.company_repository import CompanyRepository
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.whatsapp_repository import WhatsAppInstanceRepository
from app.schemas.conversation import ConversationUpdate
from app.schemas.webhook import WebhookProcessResponse
from app.services.business_service import BusinessService
from app.services.idempotency_service import IdempotencyService
from app.services.knowledge_service import KnowledgeService
from app.services.message_queue_service import MessageQueueService
from app.services.metrics_service import MetricsService
from app.services.operations_service import OperationsService
from app.services.order_flow_service import OrderFlowService
from app.utils.helpers import build_delivery_system_prompt, is_supported_evolution_event, parse_evolution_message

logger = get_logger(__name__)


class ConversationService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.settings = get_settings()
        self.company_repository = CompanyRepository(db)
        self.instance_repository = WhatsAppInstanceRepository(db)
        self.conversation_repository = ConversationRepository(db)
        self.ai_repository = AIAgentRepository(db)
        self.business_service = BusinessService(db)
        self.knowledge_service = KnowledgeService(db)
        self.metrics_service = MetricsService(db)
        self.operations_service = OperationsService(db)
        self.order_flow_service = OrderFlowService(db)
        self.idempotency_service = IdempotencyService()
        self.queue_service = MessageQueueService()
        self.openai_client = OpenAIClient()
        self.evolution_client = EvolutionClient(
            timeout_seconds=self.settings.whatsapp_timeout_seconds,
            max_length=self.settings.max_response_characters,
        )

    async def ingest_evolution_webhook(
        self,
        *,
        payload: dict,
        webhook_secret: str | None = None,
    ) -> WebhookProcessResponse:
        parsed = parse_evolution_message(payload)
        logger.info(
            "evolution_webhook_parsed",
            extra={
                "event": parsed.event,
                "instance_name": parsed.instance_name,
                "message_type": parsed.message_type,
                "provider_message_id": parsed.provider_message_id,
                "phone_number": parsed.phone_number,
                "from_me": parsed.from_me,
                "is_group": parsed.is_group,
                "is_status": parsed.is_status,
            },
        )

        if not is_supported_evolution_event(parsed.event):
            return WebhookProcessResponse(status="ignored", detail="Evento de webhook nao suportado")
        if parsed.from_me:
            return WebhookProcessResponse(status="ignored", detail="Mensagem do proprio bot ignorada")
        if parsed.is_group:
            return WebhookProcessResponse(status="ignored", detail="Mensagem de grupo ignorada")
        if parsed.is_status:
            return WebhookProcessResponse(status="ignored", detail="Evento de status ignorado")
        if not parsed.instance_name:
            return WebhookProcessResponse(status="ignored", detail="Instancia nao identificada")
        if not parsed.phone_number:
            return WebhookProcessResponse(status="ignored", detail="Numero do remetente ausente")
        if not parsed.text:
            return WebhookProcessResponse(status="ignored", detail="Mensagem sem conteudo textual aproveitavel")

        instance = self.instance_repository.get_by_instance_name(parsed.instance_name)
        if not instance or not instance.active:
            return WebhookProcessResponse(status="ignored", detail="Instancia nao encontrada ou inativa")
        if instance.webhook_secret and instance.webhook_secret != webhook_secret:
            return WebhookProcessResponse(status="ignored", detail="Webhook nao autorizado")

        company = self.company_repository.get_by_id(instance.company_id)
        if not company or company.status != "active":
            return WebhookProcessResponse(status="ignored", detail="Empresa inativa")

        if parsed.provider_message_id:
            idempotency_key = f"incoming:{company.id}:{parsed.provider_message_id}"
            if not self.idempotency_service.acquire(idempotency_key):
                return WebhookProcessResponse(
                    status="ignored",
                    detail="Mensagem ja recebida recentemente",
                    company_id=company.id,
                    provider_message_id=parsed.provider_message_id,
                )

        if parsed.provider_message_id and self.conversation_repository.message_exists(company.id, parsed.provider_message_id):
            return WebhookProcessResponse(
                status="ignored",
                detail="Mensagem duplicada ignorada",
                company_id=company.id,
                provider_message_id=parsed.provider_message_id,
            )

        contact = self.conversation_repository.get_or_create_contact(
            company_id=company.id,
            phone_number=parsed.phone_number,
            name=parsed.sender_name,
        )
        conversation = self.conversation_repository.get_open_conversation(
            company_id=company.id,
            contact_id=contact.id,
            whatsapp_instance_id=instance.id,
        ) or self.conversation_repository.create_conversation(
            company_id=company.id,
            contact_id=contact.id,
            whatsapp_instance_id=instance.id,
        )

        incoming_message = self.conversation_repository.create_message(
            company_id=company.id,
            contact_id=contact.id,
            conversation_id=conversation.id,
            whatsapp_instance_id=instance.id,
            direction="incoming",
            content=parsed.text,
            provider_message_id=parsed.provider_message_id,
            metadata_json={
                "processing_status": "queued",
                "event": parsed.event,
                "instance_name": parsed.instance_name,
                "message_type": parsed.message_type,
                "remote_jid": parsed.remote_jid,
            },
        )
        self.metrics_service.track(company.id, "incoming_messages")
        self.db.commit()

        task_id = self.queue_service.enqueue_incoming_message(company_id=company.id, message_id=incoming_message.id)
        return WebhookProcessResponse(
            status="accepted",
            detail="Mensagem recebida e enfileirada",
            company_id=company.id,
            conversation_id=conversation.id,
            provider_message_id=parsed.provider_message_id,
            task_id=task_id,
        )

    def process_incoming_message(self, *, company_id: int, message_id: int) -> dict[str, int | str | bool | None]:
        message = self.conversation_repository.get_message(company_id, message_id)
        if not message:
            raise NotFoundError("Mensagem de entrada nao encontrada")

        metadata = dict(message.metadata_json or {})
        if metadata.get("processing_status") == "completed":
            logger.info("worker_message_already_processed", extra={"company_id": company_id, "message_id": message_id})
            return {"company_id": company_id, "message_id": message_id, "processed": False}

        processing_key = f"processing:{company_id}:{message_id}"
        if not self.idempotency_service.acquire(processing_key):
            logger.info("worker_message_locked", extra={"company_id": company_id, "message_id": message_id})
            return {"company_id": company_id, "message_id": message_id, "processed": False}

        conversation = self.conversation_repository.get_conversation(company_id, message.conversation_id)
        company = self.company_repository.get_by_id(company_id)
        if not conversation or not company:
            raise NotFoundError("Contexto da mensagem nao encontrado")

        if conversation.human_handoff_active or not conversation.bot_enabled or company.bot_paused:
            metadata["processing_status"] = "skipped_human"
            message.metadata_json = metadata
            self.db.commit()
            logger.info(
                "worker_message_skipped_human_handoff",
                extra={"company_id": company_id, "message_id": message_id, "conversation_id": conversation.id},
            )
            return {"company_id": company_id, "message_id": message_id, "processed": False}

        metadata["processing_status"] = "processing"
        message.metadata_json = metadata
        self.db.flush()

        instance = self.instance_repository.get_by_id(conversation.whatsapp_instance_id) if conversation.whatsapp_instance_id else None
        automation_result = self._handle_order_automation(
            company_id=company_id,
            conversation=conversation,
            message=message,
            instance=instance,
        )

        if automation_result is not None:
            metadata["processing_status"] = "completed"
            message.metadata_json = metadata
            self.db.commit()
            return {"company_id": company_id, "message_id": message_id, "processed": True}

        reply = self._build_ai_reply(company_id, message.content, message.contact_id)
        send_ok = False
        provider_message_id: str | None = None
        raw_response: dict | str | None = None

        if instance:
            try:
                send_ok, provider_message_id, raw_response = asyncio.run(
                    self.evolution_client.send_text_message(
                        instance=instance,
                        number=conversation.contact.phone_number,
                        text=reply,
                    )
                )
            except (ExternalServiceError, IntegrationConfigurationError):
                logger.exception(
                    "worker_message_delivery_failed",
                    extra={"company_id": company_id, "message_id": message_id, "conversation_id": conversation.id},
                )
                raise

        outgoing_message = self.conversation_repository.create_message(
            company_id=company.id,
            contact_id=conversation.contact_id,
            conversation_id=conversation.id,
            whatsapp_instance_id=conversation.whatsapp_instance_id,
            direction="outgoing",
            content=reply,
            provider_message_id=provider_message_id,
            ai_generated=True,
            metadata_json={"delivery_success": send_ok, "provider_response": raw_response, "source_message_id": message.id},
        )
        self.metrics_service.track(company.id, "outgoing_messages")

        metadata["processing_status"] = "completed"
        metadata["reply_message_id"] = outgoing_message.id
        message.metadata_json = metadata
        self.db.commit()

        logger.info(
            "worker_message_completed",
            extra={
                "company_id": company_id,
                "message_id": message_id,
                "conversation_id": conversation.id,
                "reply_message_id": outgoing_message.id,
                "delivery_success": send_ok,
            },
        )
        return {"company_id": company_id, "message_id": message_id, "processed": True}

    def _handle_order_automation(self, *, company_id: int, conversation, message, instance):
        if instance is None:
            return None

        pending_order = self.order_flow_service.get_latest_pending_order(
            company_id=company_id,
            conversation_id=conversation.id,
        )

        action = self.order_flow_service.extract_confirmation_action(message.content)
        if action is not None:
            action_name, order_id = action
            if pending_order is None or pending_order.id != order_id:
                logger.warning(
                    "order_confirmation_action_ignored",
                    extra={
                        "company_id": company_id,
                        "conversation_id": conversation.id,
                        "message_id": message.id,
                        "requested_order_id": order_id,
                        "pending_order_id": pending_order.id if pending_order else None,
                    },
                )
                return None
            order = self.operations_service.update_order_status(
                company_id,
                order_id,
                "confirmed"
                if action_name == OrderFlowService.CONFIRM_ACTION
                else ("cancelled" if action_name == OrderFlowService.CANCEL_ACTION else "pending_confirmation"),
                conversation_id=conversation.id,
            )
            if action_name == OrderFlowService.CONFIRM_ACTION:
                reply = self.order_flow_service.build_post_confirmation_message(order)
            elif action_name == OrderFlowService.CANCEL_ACTION:
                reply = self.order_flow_service.build_cancel_message(order)
            else:
                reply = self.order_flow_service.build_adjustment_message(order)

            self._send_automated_outgoing_message(
                company_id=company_id,
                conversation=conversation,
                instance=instance,
                content=reply,
                source_message_id=message.id,
            )
            return {"action": action_name, "order_id": order_id}

        if pending_order is not None:
            context_updated = self.order_flow_service.update_order_context_from_text(pending_order, message.content)

            if self.order_flow_service.is_textual_cancellation(message.content):
                order = self.operations_service.update_order_status(
                    company_id,
                    pending_order.id,
                    "cancelled",
                    conversation_id=conversation.id,
                )
                self._send_automated_outgoing_message(
                    company_id=company_id,
                    conversation=conversation,
                    instance=instance,
                    content=self.order_flow_service.build_cancel_message(order),
                    source_message_id=message.id,
                )
                return {"action": OrderFlowService.CANCEL_ACTION, "order_id": order.id}

            if self.order_flow_service.is_textual_confirmation(message.content):
                order = self.operations_service.update_order_status(
                    company_id,
                    pending_order.id,
                    "confirmed",
                    conversation_id=conversation.id,
                )
                self._send_automated_outgoing_message(
                    company_id=company_id,
                    conversation=conversation,
                    instance=instance,
                    content=self.order_flow_service.build_post_confirmation_message(order),
                    source_message_id=message.id,
                )
                return {"action": OrderFlowService.CONFIRM_ACTION, "order_id": order.id}

            if context_updated and self.order_flow_service.has_checkout_context(message.content):
                self.db.commit()
                self.db.refresh(pending_order)
                self._send_automated_outgoing_message(
                    company_id=company_id,
                    conversation=conversation,
                    instance=instance,
                    content=self.order_flow_service.build_pending_context_message(pending_order),
                    source_message_id=message.id,
                )
                return {"action": "pending_update", "order_id": pending_order.id}

        draft_order = self.order_flow_service.build_or_update_draft_order(
            company_id=company_id,
            conversation=conversation,
            contact=conversation.contact,
            text=message.content,
        )
        if draft_order is None:
            return None

        self.db.commit()
        self.db.refresh(draft_order)

        summary = self.order_flow_service.build_confirmation_message(draft_order)
        self._send_automated_outgoing_message(
            company_id=company_id,
            conversation=conversation,
            instance=instance,
            content=summary,
            source_message_id=message.id,
        )
        try:
            self._send_confirmation_list(
                company_id=company_id,
                conversation=conversation,
                instance=instance,
                order=draft_order,
                source_message_id=message.id,
            )
        except (ExternalServiceError, IntegrationConfigurationError):
            logger.exception(
                "order_confirmation_list_failed",
                extra={"company_id": company_id, "conversation_id": conversation.id, "order_id": draft_order.id},
            )
            self._send_automated_outgoing_message(
                company_id=company_id,
                conversation=conversation,
                instance=instance,
                content="Se preferir, responda SIM para confirmar, AJUSTAR para alterar ou CANCELAR para encerrar este pedido.",
                source_message_id=message.id,
            )
        return {"action": "draft_confirmation", "order_id": draft_order.id}

    def _send_automated_outgoing_message(self, *, company_id: int, conversation, instance, content: str, source_message_id: int):
        success, provider_message_id, raw_response = asyncio.run(
            self.evolution_client.send_text_message(
                instance=instance,
                number=conversation.contact.phone_number,
                text=content,
            )
        )
        self.conversation_repository.create_message(
            company_id=company_id,
            contact_id=conversation.contact_id,
            conversation_id=conversation.id,
            whatsapp_instance_id=conversation.whatsapp_instance_id,
            direction="outgoing",
            content=content,
            provider_message_id=provider_message_id,
            ai_generated=True,
            metadata_json={
                "delivery_success": success,
                "provider_response": raw_response,
                "source_message_id": source_message_id,
            },
        )
        self.metrics_service.track(company_id, "outgoing_messages")

    def _send_confirmation_list(self, *, company_id: int, conversation, instance, order, source_message_id: int):
        payload = self.order_flow_service.build_confirmation_list_payload(order)
        success, provider_message_id, raw_response = asyncio.run(
            self.evolution_client.send_list_message(
                instance=instance,
                number=conversation.contact.phone_number,
                payload=payload,
            )
        )
        self.conversation_repository.create_message(
            company_id=company_id,
            contact_id=conversation.contact_id,
            conversation_id=conversation.id,
            whatsapp_instance_id=conversation.whatsapp_instance_id,
            direction="outgoing",
            content=f"Lista de confirmacao do pedido {order.code}",
            provider_message_id=provider_message_id,
            ai_generated=True,
            metadata_json={
                "delivery_success": success,
                "provider_response": raw_response,
                "source_message_id": source_message_id,
                "message_type": "interactive_list",
                "order_id": order.id,
                "list_payload": payload,
            },
        )
        self.metrics_service.track(company_id, "outgoing_messages")

    def _build_ai_reply(self, company_id: int, incoming_text: str, contact_id: int) -> str:
        if not incoming_text:
            return self.settings.default_empty_message_response

        agent = self.ai_repository.get_active_agent(company_id)
        company = self.company_repository.get_by_id(company_id)
        if not agent or not company:
            return self.settings.default_empty_message_response

        if not self.business_service.is_open_now(company_id):
            out_of_hours_message = self.business_service.get_out_of_hours_message(company_id)
            if out_of_hours_message:
                return out_of_hours_message

        history_messages = self.conversation_repository.get_recent_messages(
            company_id=company_id,
            contact_id=contact_id,
            limit=agent.max_context_messages,
        )
        history = [
            {"role": "assistant" if item.direction == "outgoing" else "user", "content": item.content}
            for item in history_messages[:-1]
            if item.content
        ]
        history = self._trim_history(history)
        operational_context = self.business_service.build_ai_operational_context(company_id)
        knowledge_context = self.knowledge_service.build_relevant_context(company_id, incoming_text)
        prompt = company.default_system_prompt or agent.system_prompt or build_delivery_system_prompt(
            company.name,
            company.agent_tone or self.settings.default_agent_style,
        )

        logger.info(
            "worker_ai_build_context",
            extra={
                "company_id": company_id,
                "contact_id": contact_id,
                "history_messages": len(history),
                "operational_snippets": len(operational_context),
                "knowledge_items": len(knowledge_context),
            },
        )

        try:
            reply = asyncio.run(
                self.openai_client.generate_reply(
                    model=agent.model,
                    system_prompt=prompt,
                    temperature=agent.temperature,
                    history=history,
                    user_message=incoming_text,
                    knowledge_snippets=[*operational_context, *knowledge_context],
                )
            )
        except (ExternalServiceError, IntegrationConfigurationError):
            logger.exception("worker_ai_generation_failed", extra={"company_id": company_id, "contact_id": contact_id})
            reply = (
                "Desculpe, estou com uma instabilidade no atendimento automatico agora. "
                "Pode tentar novamente em instantes ou aguardar o atendimento humano."
            )
        return reply

    def _trim_history(self, history: list[dict[str, str]]) -> list[dict[str, str]]:
        total_characters = 0
        trimmed: list[dict[str, str]] = []
        for item in reversed(history):
            content = item.get("content", "")
            next_total = total_characters + len(content)
            if trimmed and next_total > self.settings.max_context_characters:
                break
            trimmed.append(item)
            total_characters = next_total
        trimmed.reverse()
        return trimmed

    def list_conversations(self, company_id: int):
        return self.conversation_repository.list_conversations(company_id)

    def list_messages(self, company_id: int, conversation_id: int):
        conversation = self.conversation_repository.get_conversation(company_id, conversation_id)
        if not conversation:
            raise NotFoundError("Conversa nao encontrada")
        return self.conversation_repository.list_messages(company_id, conversation_id)

    def update_conversation(self, company_id: int, conversation_id: int, payload: ConversationUpdate):
        conversation = self.conversation_repository.get_conversation(company_id, conversation_id)
        if not conversation:
            raise NotFoundError("Conversa nao encontrada")
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(conversation, field, value)
        self.db.commit()
        self.db.refresh(conversation)
        return conversation

    async def send_manual_message(self, company_id: int, conversation_id: int, user: User, content: str):
        conversation = self.conversation_repository.get_conversation(company_id, conversation_id)
        if not conversation:
            raise NotFoundError("Conversa nao encontrada")
        if not conversation.whatsapp_instance_id:
            raise NotFoundError("Conversa sem instancia de WhatsApp")

        instance = self.instance_repository.get_by_id(conversation.whatsapp_instance_id)
        if not instance:
            raise NotFoundError("Instancia nao encontrada")

        success, provider_message_id, raw_response = await self.evolution_client.send_text_message(
            instance=instance,
            number=conversation.contact.phone_number,
            text=content,
        )
        message = self.conversation_repository.create_message(
            company_id=company_id,
            contact_id=conversation.contact_id,
            conversation_id=conversation.id,
            whatsapp_instance_id=instance.id,
            direction="outgoing",
            content=content,
            provider_message_id=provider_message_id,
            ai_generated=False,
            metadata_json={"delivery_success": success, "provider_response": raw_response, "sent_by_user_id": user.id},
        )
        self.metrics_service.track(company_id, "outgoing_messages")
        self.db.commit()
        self.db.refresh(message)
        return message
