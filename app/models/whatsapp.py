from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def utc_now() -> datetime:
    return datetime.now(UTC)


class WhatsAppInstance(Base):
    __tablename__ = "whatsapp_instances"
    __table_args__ = (
        UniqueConstraint("instance_name", name="uq_whatsapp_instances_instance_name"),
        Index("ix_whatsapp_instances_company_active", "company_id", "active"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    instance_name: Mapped[str] = mapped_column(String(120), index=True)
    api_base_url: Mapped[str] = mapped_column(String(500))
    api_key: Mapped[str] = mapped_column(String(500))
    phone_number: Mapped[str | None] = mapped_column(String(30), nullable=True)
    webhook_secret: Mapped[str | None] = mapped_column(String(255), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        server_default=func.now(),
    )

    company = relationship("Company", back_populates="whatsapp_instances")
    conversations = relationship("Conversation", back_populates="whatsapp_instance")
    messages = relationship("Message", back_populates="whatsapp_instance")
