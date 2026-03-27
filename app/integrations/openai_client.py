from __future__ import annotations

from collections.abc import Iterable
from typing import Any

import httpx

from app.core.config import get_settings
from app.core.exceptions import ExternalServiceError, IntegrationConfigurationError
from app.core.http_client import build_default_http_client
from app.core.logging_config import get_logger
from app.schemas.conversation import ParsedIncomingMessage
from app.utils.helpers import clean_text, truncate_text

logger = get_logger(__name__)


class OpenAIClient:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.base_url = "https://api.openai.com/v1/chat/completions"
        self.http_client = build_default_http_client(self.settings.openai_timeout_seconds)

    async def generate_reply(
        self,
        *,
        model: str,
        system_prompt: str,
        temperature: float,
        history: Iterable[dict[str, str]],
        user_message: str,
        knowledge_snippets: list[str],
    ) -> str:
        if not self.settings.openai_api_key:
            raise IntegrationConfigurationError("OPENAI_API_KEY não configurada")

        messages: list[dict[str, str]] = [{"role": "system", "content": system_prompt}]
        if knowledge_snippets:
            knowledge_context = "\n\n".join(f"- {item}" for item in knowledge_snippets)
            messages.append(
                {
                    "role": "system",
                    "content": (
                        "Use estas informações da base de conhecimento somente se forem relevantes "
                        f"e não invente nada fora delas:\n{knowledge_context}"
                    ),
                }
            )

        messages.extend(history)
        messages.append({"role": "user", "content": truncate_text(clean_text(user_message), 2000)})

        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": self.settings.openai_max_completion_tokens,
        }
        headers = {
            "Authorization": f"Bearer {self.settings.openai_api_key}",
            "Content-Type": "application/json",
        }

        try:
            response = await self.http_client.post_json(
                url=self.base_url,
                headers=headers,
                json_body=payload,
                operation_name="openai_request",
            )
        except (httpx.HTTPError, RuntimeError) as exc:
            logger.exception("openai_request_failed")
            raise ExternalServiceError("Falha ao consultar OpenAI") from exc

        try:
            data = response.json()
        except ValueError as exc:
            raise ExternalServiceError("Resposta inválida da OpenAI") from exc

        choices = data.get("choices")
        if not isinstance(choices, list) or not choices:
            raise ExternalServiceError("Resposta vazia da OpenAI")

        message = choices[0].get("message", {})
        content = message.get("content", "")
        if isinstance(content, list):
            content = " ".join(
                item.get("text", "").strip()
                for item in content
                if isinstance(item, dict) and item.get("text")
            )
        if not isinstance(content, str) or not content.strip():
            raise ExternalServiceError("Resposta vazia da OpenAI")

        return truncate_text(clean_text(content), self.settings.max_response_characters)

