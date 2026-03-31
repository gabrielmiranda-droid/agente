from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_name: str
    quantity: int
    unit_price: float
    total_price: float
    addons_json: list[dict] | None = None
    notes: str | None = None


class OrderPrintJobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trigger_status: str
    printer_target: str | None
    payload_text: str | None
    printed: bool
    printed_at: datetime | None
    created_at: datetime


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    conversation_id: int | None
    code: str
    status: str
    fulfillment_type: str
    payment_method: str | None
    customer_name: str | None
    customer_phone: str | None
    delivery_address: str | None
    neighborhood: str | None
    notes: str | None
    subtotal: float
    delivery_fee: float
    discount_amount: float
    total_amount: float
    printed_at: datetime | None
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemResponse] = Field(default_factory=list)
    print_jobs: list[OrderPrintJobResponse] = Field(default_factory=list)


class OrderStatusUpdate(BaseModel):
    status: str = Field(pattern="^(new|pending_confirmation|confirmed|in_preparation|out_for_delivery|ready_for_pickup|completed|cancelled)$")


class ClientStatItem(BaseModel):
    label: str
    value: str | int | float
    hint: str
    tone: str = "default"


class ClientDashboardResponse(BaseModel):
    stats: list[ClientStatItem]
    orders: list[OrderResponse]
    inbox_counts: dict[str, int]
    catalog_summary: dict[str, int]
    inventory_alerts: list[dict]
    finance_summary: dict
    business_snapshot: dict
    ai_context_sources: list[dict]


class DevDashboardResponse(BaseModel):
    global_stats: list[ClientStatItem]
    company_breakdown: list[dict]
    plan_breakdown: list[dict]
    ai_usage: dict
    global_logs: list[dict]
    channel_summary: list[dict]


class InventoryItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    product_id: int | None
    name: str
    unit: str
    current_quantity: float
    low_stock_threshold: float
    active: bool
    available_for_sale: bool
    created_at: datetime
    updated_at: datetime


class FinanceSummaryResponse(BaseModel):
    period_start: date
    period_end: date
    total_sold: float
    average_ticket: float
    orders_count: int
    payment_breakdown: dict[str, float]
    top_products: list[dict]
