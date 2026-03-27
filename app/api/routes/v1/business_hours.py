from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles, resolve_company_id
from app.db.session import get_db
from app.schemas.business import BusinessHourCreate, BusinessHourResponse, BusinessHourUpdate
from app.services.business_service import BusinessService

router = APIRouter(prefix="/business-hours", tags=["business-hours"])


@router.get("", response_model=list[BusinessHourResponse])
def list_business_hours(
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> list[BusinessHourResponse]:
    return [BusinessHourResponse.model_validate(item) for item in BusinessService(db).list_business_hours(company_id)]


@router.post("", response_model=BusinessHourResponse, status_code=status.HTTP_201_CREATED)
def create_business_hour(
    payload: BusinessHourCreate,
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> BusinessHourResponse:
    item = BusinessService(db).create_or_update_business_hour(company_id, payload)
    return BusinessHourResponse.model_validate(item)


@router.patch("/{hour_id}", response_model=BusinessHourResponse)
def update_business_hour(
    hour_id: int,
    payload: BusinessHourUpdate,
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> BusinessHourResponse:
    item = BusinessService(db).update_business_hour(company_id, hour_id, payload)
    return BusinessHourResponse.model_validate(item)
