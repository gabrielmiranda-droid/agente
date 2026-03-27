from typing import Any

from pydantic import BaseModel, ConfigDict, Field, model_validator


class EvolutionWebhookEnvelope(BaseModel):
    model_config = ConfigDict(extra="allow")

    event: str | None = None
    instance: str | None = None
    data: dict[str, Any] | list[Any] | None = None
    raw_payload: dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode="before")
    @classmethod
    def capture_raw_payload(cls, value: Any) -> Any:
        if not isinstance(value, dict):
            raise ValueError("Payload do webhook deve ser um objeto JSON")
        enriched = dict(value)
        enriched["raw_payload"] = dict(value)
        return enriched


class WebhookProcessResponse(BaseModel):
    status: str
    detail: str
    company_id: int | None = None
    conversation_id: int | None = None
    provider_message_id: str | None = None
    task_id: str | None = None
