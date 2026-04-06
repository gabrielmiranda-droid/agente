from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_roles, resolve_company_id
from app.db.session import get_db
from app.schemas.conversation import (
    ConversationResponse,
    ConversationUpdate,
    HandoffCloseRequest,
    HandoffRequest,
    ManualMessageCreate,
    MessageResponse,
)
from app.services.agent_service import AgentService
from app.services.conversation_service import ConversationService

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("", response_model=list[ConversationResponse])
def list_conversations(
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "client", "attendant")),
    db: Session = Depends(get_db),
) -> list[ConversationResponse]:
    items = ConversationService(db).list_conversations(company_id)
    return [ConversationResponse.model_validate(item) for item in items]


@router.get("/{conversation_id}/messages", response_model=list[MessageResponse])
def list_messages(
    conversation_id: int,
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "client", "attendant")),
    db: Session = Depends(get_db),
) -> list[MessageResponse]:
    items = ConversationService(db).list_messages(company_id, conversation_id)
    return [MessageResponse.model_validate(item) for item in items]


@router.patch("/{conversation_id}", response_model=ConversationResponse)
def update_conversation(
    conversation_id: int,
    payload: ConversationUpdate,
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "client", "attendant")),
    db: Session = Depends(get_db),
) -> ConversationResponse:
    item = ConversationService(db).update_conversation(company_id, conversation_id, payload)
    return ConversationResponse.model_validate(item)


@router.post("/{conversation_id}/handoff")
def start_handoff(
    conversation_id: int,
    payload: HandoffRequest,
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "client", "attendant")),
    db: Session = Depends(get_db),
):
    handoff = AgentService(db).start_handoff(company_id, conversation_id, payload)
    return {"detail": "Handoff iniciado", "handoff_id": handoff.id}


@router.post("/{conversation_id}/handoff/close")
def close_handoff(
    conversation_id: int,
    payload: HandoffCloseRequest,
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "client", "attendant")),
    db: Session = Depends(get_db),
):
    AgentService(db).close_handoff(company_id, conversation_id, payload.restore_bot)
    return {"detail": "Handoff encerrado"}


@router.post("/{conversation_id}/pause-bot")
def pause_bot(
    conversation_id: int,
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "client", "attendant")),
    db: Session = Depends(get_db),
):
    item = ConversationService(db).update_conversation(
        company_id,
        conversation_id,
        ConversationUpdate(bot_enabled=False),
    )
    return {"detail": "Bot pausado", "conversation_id": item.id}


@router.post("/{conversation_id}/resume-bot")
def resume_bot(
    conversation_id: int,
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "client", "attendant")),
    db: Session = Depends(get_db),
):
    item = ConversationService(db).update_conversation(
        company_id,
        conversation_id,
        ConversationUpdate(bot_enabled=True, status="open"),
    )
    return {"detail": "Bot reativado", "conversation_id": item.id}


@router.post("/{conversation_id}/messages", response_model=MessageResponse)
async def send_manual_message(
    conversation_id: int,
    payload: ManualMessageCreate,
    company_id: int = Depends(resolve_company_id),
    current_user=Depends(get_current_user),
    _: object = Depends(require_roles("dev", "client", "attendant")),
    db: Session = Depends(get_db),
) -> MessageResponse:
    item = await ConversationService(db).send_manual_message(company_id, conversation_id, current_user, payload.content)
    return MessageResponse.model_validate(item)
