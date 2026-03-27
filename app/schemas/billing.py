from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    max_messages_per_month: int
    max_users: int
    max_whatsapp_instances: int
    max_ai_tokens_per_month: int


class SubscriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    plan_id: int
    status: str
    starts_at: datetime
    ends_at: datetime | None
