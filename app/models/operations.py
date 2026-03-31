from datetime import UTC, date, datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def utc_now() -> datetime:
    return datetime.now(UTC)


class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (
        Index("ix_orders_company_status_created", "company_id", "status", "created_at"),
        Index("ix_orders_company_type_created", "company_id", "fulfillment_type", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), index=True)
    conversation_id: Mapped[int | None] = mapped_column(
        ForeignKey("conversations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    contact_id: Mapped[int | None] = mapped_column(ForeignKey("contacts.id", ondelete="SET NULL"), nullable=True, index=True)
    code: Mapped[str] = mapped_column(String(50), index=True)
    status: Mapped[str] = mapped_column(String(30), default="new", index=True)
    fulfillment_type: Mapped[str] = mapped_column(String(30), default="delivery", index=True)
    payment_method: Mapped[str | None] = mapped_column(String(50), nullable=True)
    customer_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    customer_phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    delivery_address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    neighborhood: Mapped[str | None] = mapped_column(String(120), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    delivery_fee: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    discount_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    printed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        server_default=func.now(),
    )

    company = relationship("Company", back_populates="orders")
    conversation = relationship("Conversation", back_populates="orders")
    contact = relationship("Contact")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    print_jobs = relationship("OrderPrintJob", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"
    __table_args__ = (Index("ix_order_items_company_order", "company_id", "order_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    product_name: Mapped[str] = mapped_column(String(255))
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    total_price: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    addons_json: Mapped[list[dict] | None] = mapped_column(JSON, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")


class OrderPrintJob(Base):
    __tablename__ = "order_print_jobs"
    __table_args__ = (
        UniqueConstraint("company_id", "order_id", "trigger_status", "printer_target", name="uq_order_print_jobs_status_target"),
        Index("ix_order_print_jobs_company_created", "company_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    trigger_status: Mapped[str] = mapped_column(String(30), index=True)
    printer_target: Mapped[str | None] = mapped_column(String(120), nullable=True)
    payload_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    printed: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    printed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, server_default=func.now())

    order = relationship("Order", back_populates="print_jobs")


class InventoryItem(Base):
    __tablename__ = "inventory_items"
    __table_args__ = (
        UniqueConstraint("company_id", "name", name="uq_inventory_items_company_name"),
        Index("ix_inventory_items_company_low_stock", "company_id", "low_stock_threshold", "current_quantity"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    unit: Mapped[str] = mapped_column(String(30), default="un")
    current_quantity: Mapped[float] = mapped_column(Numeric(12, 3), default=0)
    low_stock_threshold: Mapped[float] = mapped_column(Numeric(12, 3), default=0)
    active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    available_for_sale: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        server_default=func.now(),
    )

    company = relationship("Company", back_populates="inventory_items")
    product = relationship("Product")
    stock_movements = relationship("StockMovement", back_populates="inventory_item", cascade="all, delete-orphan")


class StockMovement(Base):
    __tablename__ = "stock_movements"
    __table_args__ = (Index("ix_stock_movements_company_created", "company_id", "created_at"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), index=True)
    inventory_item_id: Mapped[int] = mapped_column(ForeignKey("inventory_items.id", ondelete="CASCADE"), index=True)
    order_id: Mapped[int | None] = mapped_column(ForeignKey("orders.id", ondelete="SET NULL"), nullable=True, index=True)
    movement_type: Mapped[str] = mapped_column(String(30), index=True)
    quantity_delta: Mapped[float] = mapped_column(Numeric(12, 3))
    reference: Mapped[str | None] = mapped_column(String(120), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, server_default=func.now())

    inventory_item = relationship("InventoryItem", back_populates="stock_movements")
    order = relationship("Order")


class PricingRule(Base):
    __tablename__ = "pricing_rules"
    __table_args__ = (Index("ix_pricing_rules_company_active", "company_id", "active"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    rule_name: Mapped[str] = mapped_column(String(255))
    cost_amount: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    base_price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    margin_percent: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)
    promotional_price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        server_default=func.now(),
    )

    product = relationship("Product")


class FinancialMetric(Base):
    __tablename__ = "financial_metrics"
    __table_args__ = (
        UniqueConstraint("company_id", "metric_date", "period_type", name="uq_financial_metrics_period"),
        Index("ix_financial_metrics_company_date", "company_id", "metric_date"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), index=True)
    metric_date: Mapped[date] = mapped_column(Date, index=True)
    period_type: Mapped[str] = mapped_column(String(20), default="daily", index=True)
    gross_sales: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    order_count: Mapped[int] = mapped_column(Integer, default=0)
    average_ticket: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    payment_breakdown: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    top_products: Mapped[list[dict] | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        server_default=func.now(),
    )


class AIUsageMetric(Base):
    __tablename__ = "ai_usage_metrics"
    __table_args__ = (
        Index("ix_ai_usage_metrics_company_created", "company_id", "created_at"),
        Index("ix_ai_usage_metrics_company_model", "company_id", "model_name"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), index=True)
    conversation_id: Mapped[int | None] = mapped_column(
        ForeignKey("conversations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    model_name: Mapped[str] = mapped_column(String(120), index=True)
    prompt_tokens: Mapped[int] = mapped_column(Integer, default=0)
    completion_tokens: Mapped[int] = mapped_column(Integer, default=0)
    total_tokens: Mapped[int] = mapped_column(Integer, default=0)
    estimated_cost: Mapped[float] = mapped_column(Numeric(10, 4), default=0)
    source: Mapped[str | None] = mapped_column(String(120), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, server_default=func.now())
