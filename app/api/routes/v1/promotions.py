from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles, resolve_company_id
from app.db.session import get_db
from app.schemas.business import PromotionCreate, PromotionResponse, PromotionUpdate
from app.services.business_service import BusinessService

router = APIRouter(prefix="/promotions", tags=["promotions"])


@router.get("", response_model=list[PromotionResponse])
def list_promotions(
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> list[PromotionResponse]:
    return [PromotionResponse.model_validate(item) for item in BusinessService(db).list_promotions(company_id)]


@router.post("", response_model=PromotionResponse, status_code=status.HTTP_201_CREATED)
def create_promotion(
    payload: PromotionCreate,
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> PromotionResponse:
    item = BusinessService(db).create_promotion(company_id, payload)
    return PromotionResponse.model_validate(item)


@router.patch("/{promotion_id}", response_model=PromotionResponse)
def update_promotion(
    promotion_id: int,
    payload: PromotionUpdate,
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> PromotionResponse:
    item = BusinessService(db).update_promotion(company_id, promotion_id, payload)
    return PromotionResponse.model_validate(item)
