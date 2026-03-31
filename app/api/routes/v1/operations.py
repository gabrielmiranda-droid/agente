from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_dev, require_roles, resolve_company_id
from app.db.session import get_db
from app.schemas.operations import (
    ClientDashboardResponse,
    FinanceSummaryResponse,
    InventoryItemResponse,
    OrderResponse,
    OrderStatusUpdate,
    DevDashboardResponse,
)
from app.services.operations_service import OperationsService

router = APIRouter(prefix="/operations", tags=["operations"])


@router.get("/client-panel", response_model=ClientDashboardResponse)
def get_client_panel(
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "client", "attendant")),
    db: Session = Depends(get_db),
) -> ClientDashboardResponse:
    return OperationsService(db).get_client_dashboard(company_id)


@router.get("/dev-panel", response_model=DevDashboardResponse)
def get_dev_panel(
    _: object = Depends(require_dev),
    db: Session = Depends(get_db),
) -> DevDashboardResponse:
    return OperationsService(db).get_dev_dashboard()


@router.get("/orders", response_model=list[OrderResponse])
def list_orders(
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "client", "attendant")),
    db: Session = Depends(get_db),
) -> list[OrderResponse]:
    items = OperationsService(db).list_orders(company_id)
    return [OrderResponse.model_validate(item) for item in items]


@router.patch("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "client", "attendant")),
    db: Session = Depends(get_db),
) -> OrderResponse:
    item = OperationsService(db).update_order_status(company_id, order_id, payload.status)
    return OrderResponse.model_validate(item)


@router.get("/inventory", response_model=list[InventoryItemResponse])
def list_inventory(
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "client", "attendant")),
    db: Session = Depends(get_db),
) -> list[InventoryItemResponse]:
    items = OperationsService(db).list_inventory(company_id)
    return [InventoryItemResponse.model_validate(item) for item in items]


@router.get("/finance", response_model=FinanceSummaryResponse)
def get_finance(
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "client", "attendant")),
    db: Session = Depends(get_db),
) -> FinanceSummaryResponse:
    return OperationsService(db).get_finance_summary(company_id)
