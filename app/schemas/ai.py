from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class AIAgentCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    model: str = Field(min_length=2, max_length=120)
    system_prompt: str = Field(min_length=10)
    temperature: float = Field(default=0.3, ge=0, le=1.5)
    max_context_messages: int = Field(default=12, ge=1, le=50)
    active: bool = True


class AIAgentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    name: str
    model: str
    temperature: float
    max_context_messages: int
    active: bool
    created_at: datetime


class KnowledgeItemCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    content: str = Field(min_length=5)
    category: str | None = Field(default=None, max_length=120)
    active: bool = True


class KnowledgeItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    title: str
    content: str
    category: str | None
    active: bool
    created_at: datetime


class UsageMetricResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    metric_date: date
    metric_name: str
    metric_value: int
    estimated_cost: float

