from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.billing import Plan, Subscription


class BillingRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_plans(self) -> list[Plan]:
        return list(self.db.scalars(select(Plan).order_by(Plan.id.asc())).all())

    def get_plan_by_code(self, code: str) -> Plan | None:
        return self.db.scalar(select(Plan).where(Plan.code == code))

    def get_active_subscription(self, company_id: int) -> Subscription | None:
        return self.db.scalar(
            select(Subscription)
            .where(Subscription.company_id == company_id, Subscription.status == "active")
            .order_by(Subscription.created_at.desc())
        )
