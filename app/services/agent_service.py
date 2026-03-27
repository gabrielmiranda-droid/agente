from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import NotFoundError
from app.models.ai import AIAgent, HumanHandoff
from app.repositories.ai_repository import AIAgentRepository
from app.repositories.conversation_repository import ConversationRepository
from app.schemas.ai import AIAgentCreate
from app.schemas.conversation import HandoffRequest


class AgentService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.settings = get_settings()
        self.ai_repository = AIAgentRepository(db)
        self.conversation_repository = ConversationRepository(db)

    def create_agent(self, company_id: int, payload: AIAgentCreate) -> AIAgent:
        agent = AIAgent(
            company_id=company_id,
            name=payload.name,
            model=payload.model,
            system_prompt=payload.system_prompt,
            temperature=payload.temperature,
            max_context_messages=payload.max_context_messages,
            active=payload.active,
        )
        self.ai_repository.create_agent(agent)
        self.db.commit()
        self.db.refresh(agent)
        return agent

    def list_agents(self, company_id: int) -> list[AIAgent]:
        return self.ai_repository.list_agents(company_id)

    def start_handoff(self, company_id: int, conversation_id: int, payload: HandoffRequest) -> HumanHandoff:
        conversation = self.conversation_repository.get_conversation(company_id, conversation_id)
        if not conversation:
            raise NotFoundError("Conversa não encontrada")

        conversation.status = "human_handoff"
        conversation.human_handoff_active = True
        conversation.bot_enabled = False
        conversation.assigned_user_id = payload.assigned_user_id

        handoff = HumanHandoff(
            company_id=company_id,
            conversation_id=conversation.id,
            assigned_user_id=payload.assigned_user_id,
            reason=payload.reason,
            status="active",
        )
        self.ai_repository.create_handoff(handoff)
        self.db.commit()
        self.db.refresh(handoff)
        return handoff

    def close_handoff(self, company_id: int, conversation_id: int, restore_bot: bool) -> None:
        conversation = self.conversation_repository.get_conversation(company_id, conversation_id)
        if not conversation:
            raise NotFoundError("Conversa não encontrada")

        handoff = self.ai_repository.get_active_handoff(conversation_id)
        if handoff:
            from datetime import UTC, datetime

            handoff.status = "closed"
            handoff.ended_at = datetime.now(UTC)

        conversation.human_handoff_active = False
        conversation.bot_enabled = restore_bot
        conversation.status = "open" if restore_bot else "resolved"
        self.db.commit()
