from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_dev, resolve_company_id
from app.db.session import get_db
from app.repositories.whatsapp_repository import WhatsAppInstanceRepository
from app.schemas.whatsapp import WhatsAppInstanceCreate, WhatsAppInstanceResponse
from app.services.company_service import CompanyService

router = APIRouter(prefix="/whatsapp-instances", tags=["whatsapp"])


@router.get("", response_model=list[WhatsAppInstanceResponse])
def list_instances(
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_dev),
    db: Session = Depends(get_db),
) -> list[WhatsAppInstanceResponse]:
    items = WhatsAppInstanceRepository(db).list_by_company(company_id)
    return [WhatsAppInstanceResponse.model_validate(item) for item in items]


@router.post("", response_model=WhatsAppInstanceResponse, status_code=status.HTTP_201_CREATED)
def create_instance(
    payload: WhatsAppInstanceCreate,
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_dev),
    db: Session = Depends(get_db),
) -> WhatsAppInstanceResponse:
    instance = CompanyService(db).create_whatsapp_instance(company_id, payload)
    return WhatsAppInstanceResponse.model_validate(instance)
