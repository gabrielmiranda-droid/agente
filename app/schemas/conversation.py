from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ContactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    phone_number: str
    name: str | None


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    direction: str
    content: str
    provider_message_id: str | None
    ai_generated: bool
    created_at: datetime


class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    contact_id: int
    whatsapp_instance_id: int | None
    assigned_user_id: int | None
    status: str
    bot_enabled: bool
    human_handoff_active: bool
    internal_notes: str | None
    tags: list[str] | None
    last_message_at: datetime | None
    created_at: datetime
    updated_at: datetime
    contact_name: str | None = None
    contact_phone_number: str | None = None
    last_message_preview: str | None = None
    last_message_direction: str | None = None


class ManualMessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=4000)


class ConversationUpdate(BaseModel):
    status: str | None = None
    bot_enabled: bool | None = None
    internal_notes: str | None = None
    tags: list[str] | None = None


class HandoffRequest(BaseModel):
    assigned_user_id: int | None = None
    reason: str | None = Field(default=None, max_length=1000)


class HandoffCloseRequest(BaseModel):
    restore_bot: bool = True


class ParsedIncomingMessage(BaseModel):
    event: str | None = None
    instance_name: str | None = None
    provider_message_id: str | None = None
    remote_jid: str | None = None
    phone_number: str
    sender_name: str | None = None
    text: str = ""
    message_type: str | None = None
    from_me: bool = False
    is_group: bool = False
    is_status: bool = False
    raw_payload: dict[str, Any]
