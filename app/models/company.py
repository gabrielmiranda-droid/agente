from datetime import UTC, datetime

from sqlalchemy import JSON, DateTime, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def utc_now() -> datetime:
    return datetime.now(UTC)


class Company(Base):
    __tablename__ = "companies"
    __table_args__ = (UniqueConstraint("slug", name="uq_companies_slug"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    slug: Mapped[str] = mapped_column(String(120), index=True)
    status: Mapped[str] = mapped_column(String(30), default="active", index=True)
    settings: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    agent_tone: Mapped[str | None] = mapped_column(String(255), nullable=True)
    default_system_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    business_hours: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    absence_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    integrations_config: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    bot_paused: Mapped[bool] = mapped_column(default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        server_default=func.now(),
    )

    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    whatsapp_instances = relationship("WhatsAppInstance", back_populates="company", cascade="all, delete-orphan")
    contacts = relationship("Contact", back_populates="company", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="company", cascade="all, delete-orphan")
    ai_agents = relationship("AIAgent", back_populates="company", cascade="all, delete-orphan")
    handoffs = relationship("HumanHandoff", back_populates="company", cascade="all, delete-orphan")
    knowledge_items = relationship("KnowledgeItem", back_populates="company", cascade="all, delete-orphan")
    usage_metrics = relationship("UsageMetric", back_populates="company", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="company", cascade="all, delete-orphan")
    business_profile = relationship("BusinessProfile", back_populates="company", cascade="all, delete-orphan", uselist=False)
    product_categories = relationship("ProductCategory", back_populates="company", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="company", cascade="all, delete-orphan")
    product_addons = relationship("ProductAddon", back_populates="company", cascade="all, delete-orphan")
    business_hours_entries = relationship("BusinessHour", back_populates="company", cascade="all, delete-orphan")
    promotions = relationship("Promotion", back_populates="company", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="company", cascade="all, delete-orphan")
    inventory_items = relationship("InventoryItem", back_populates="company", cascade="all, delete-orphan")
