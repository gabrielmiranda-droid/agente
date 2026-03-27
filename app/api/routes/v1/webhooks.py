from typing import Any

from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.orm import Session

from app.core.logging_config import get_logger
from app.db.session import get_db
from app.schemas.webhook import EvolutionWebhookEnvelope, WebhookProcessResponse
from app.services.conversation_service import ConversationService

logger = get_logger(__name__)
router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/evolution", response_model=WebhookProcessResponse)
async def evolution_webhook(
    payload: dict[str, Any],
    request: Request,
    x_webhook_secret: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> WebhookProcessResponse:
    envelope = EvolutionWebhookEnvelope.model_validate(payload)
    logger.info(
        "webhook_received",
        extra={
            "client_host": request.client.host if request.client else None,
            "event": envelope.event,
            "instance": envelope.instance,
        },
    )
    return await ConversationService(db).ingest_evolution_webhook(
        payload=envelope.raw_payload,
        webhook_secret=x_webhook_secret,
    )
