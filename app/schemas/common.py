from datetime import datetime

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    environment: str
    version: str = "2.0.0"


class MessageResponse(BaseModel):
    detail: str
    timestamp: datetime | None = None

