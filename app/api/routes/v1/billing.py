from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_dev, resolve_company_id
from app.db.session import get_db
from app.repositories.billing_repository import BillingRepository
from app.schemas.billing import PlanResponse, SubscriptionResponse

router = APIRouter(prefix="/billing", tags=["billing"])


@router.get("/plans", response_model=list[PlanResponse])
def list_plans(
    _: object = Depends(require_dev),
    db: Session = Depends(get_db),
) -> list[PlanResponse]:
    items = BillingRepository(db).list_plans()
    return [PlanResponse.model_validate(item) for item in items]


@router.get("/subscription", response_model=SubscriptionResponse | None)
def current_subscription(
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_dev),
    db: Session = Depends(get_db),
) -> SubscriptionResponse | None:
    item = BillingRepository(db).get_active_subscription(company_id)
    return SubscriptionResponse.model_validate(item) if item else None
