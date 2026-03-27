from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.repositories.metric_repository import MetricRepository


class MetricsService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.metric_repository = MetricRepository(db)

    def track(self, company_id: int, metric_name: str, amount: int = 1, estimated_cost: float = 0.0) -> None:
        self.metric_repository.increment_metric(
            company_id=company_id,
            metric_name=metric_name,
            metric_date=datetime.now(UTC).date(),
            amount=amount,
            estimated_cost=estimated_cost,
        )
        self.db.flush()
