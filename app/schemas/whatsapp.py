from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class WhatsAppInstanceCreate(BaseModel):
    company_id: int | None = Field(default=None, ge=1)
    name: str = Field(min_length=2, max_length=255)
    instance_name: str = Field(min_length=2, max_length=120)
    api_base_url: str = Field(min_length=5, max_length=500)
    api_key: str = Field(min_length=1, max_length=500)
    phone_number: str | None = Field(default=None, max_length=30)
    webhook_secret: str | None = Field(default=None, max_length=255)
    active: bool = True


class WhatsAppInstanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    name: str
    instance_name: str
    api_base_url: str
    phone_number: str | None
    active: bool
    created_at: datetime
