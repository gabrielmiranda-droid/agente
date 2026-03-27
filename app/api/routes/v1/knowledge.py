from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles, resolve_company_id
from app.db.session import get_db
from app.schemas.ai import KnowledgeItemCreate, KnowledgeItemResponse
from app.services.knowledge_service import KnowledgeService

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


@router.get("", response_model=list[KnowledgeItemResponse])
def list_knowledge(
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> list[KnowledgeItemResponse]:
    items = KnowledgeService(db).list_items(company_id)
    return [KnowledgeItemResponse.model_validate(item) for item in items]


@router.post("", response_model=KnowledgeItemResponse, status_code=status.HTTP_201_CREATED)
def create_knowledge(
    payload: KnowledgeItemCreate,
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> KnowledgeItemResponse:
    item = KnowledgeService(db).create_item(company_id, payload)
    return KnowledgeItemResponse.model_validate(item)
