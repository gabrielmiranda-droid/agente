from __future__ import annotations

from typing import Any
from uuid import uuid4

import httpx

from app.core.exceptions import ExternalServiceError
from app.core.http_client import build_default_http_client
from app.core.logging_config import get_logger, mask_phone_number
from app.models.whatsapp import WhatsAppInstance
from app.utils.helpers import clean_text, normalize_phone_number, truncate_text

logger = get_logger(__name__)


class EvolutionClient:
    def __init__(self, timeout_seconds: float, max_length: int) -> None:
        self.http_client = build_default_http_client(timeout_seconds)
        self.max_length = max_length

    async def send_text_message(
        self,
        *,
        instance: WhatsAppInstance,
        number: str,
        text: str,
    ) -> tuple[bool, str | None, dict[str, Any] | str | None]:
        normalized_number = normalize_phone_number(number)
        if not normalized_number:
            return False, None, {"detail": "Número inválido"}

        url = f"{instance.api_base_url.rstrip('/')}/message/sendText/{instance.instance_name}"
        payload = {
            "number": normalized_number,
            "text": truncate_text(clean_text(text), self.max_length),
        }
        headers = {"Content-Type": "application/json", "apikey": instance.api_key}

        logger.info(
            "evolution_send_started",
            extra={
                "instance_name": instance.instance_name,
                "number": mask_phone_number(normalized_number),
            },
        )

        try:
            response = await self.http_client.post_json(
                url=url,
                headers=headers,
                json_body=payload,
                operation_name="evolution_send",
            )
        except (httpx.HTTPError, RuntimeError) as exc:
            logger.exception("evolution_send_failed")
            raise ExternalServiceError("Falha ao enviar mensagem pela Evolution API") from exc

        try:
            raw_response = response.json()
        except ValueError:
            raw_response = response.text

        provider_message_id = self._extract_message_id(raw_response)
        return True, provider_message_id, raw_response

    @staticmethod
    def _extract_message_id(raw_response: dict[str, Any] | str | None) -> str:
        if isinstance(raw_response, dict):
            for key in ("id", "messageId", "message_id"):
                value = raw_response.get(key)
                if isinstance(value, str) and value.strip():
                    return value.strip()
            key_data = raw_response.get("key")
            if isinstance(key_data, dict):
                nested = key_data.get("id")
                if isinstance(nested, str) and nested.strip():
                    return nested.strip()
        return f"evo-{uuid4()}"
