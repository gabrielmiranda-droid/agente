from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles, resolve_company_id
from app.db.session import get_db
from app.schemas.business import BusinessProfileResponse, BusinessProfileUpdate
from app.services.business_service import BusinessService

router = APIRouter(prefix="/business-profile", tags=["business"])


@router.get("", response_model=BusinessProfileResponse)
def get_business_profile(
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> BusinessProfileResponse:
    item = BusinessService(db).get_or_create_profile(company_id)
    return BusinessProfileResponse.model_validate(item)


@router.put("", response_model=BusinessProfileResponse, status_code=status.HTTP_200_OK)
def update_business_profile(
    payload: BusinessProfileUpdate,
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> BusinessProfileResponse:
    item = BusinessService(db).update_profile(company_id, payload)
    return BusinessProfileResponse.model_validate(item)
