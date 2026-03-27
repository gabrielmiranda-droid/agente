from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CompanyCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    slug: str = Field(min_length=2, max_length=120)
    status: str = "active"
    agent_tone: str | None = Field(default=None, max_length=255)
    default_system_prompt: str | None = None
    business_hours: dict | None = None
    absence_message: str | None = None
    settings: dict | None = None


class CompanyUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    status: str | None = None
    agent_tone: str | None = Field(default=None, max_length=255)
    default_system_prompt: str | None = None
    business_hours: dict | None = None
    absence_message: str | None = None
    settings: dict | None = None
    bot_paused: bool | None = None


class CompanyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    status: str
    agent_tone: str | None
    absence_message: str | None
    bot_paused: bool
    created_at: datetime
    updated_at: datetime

