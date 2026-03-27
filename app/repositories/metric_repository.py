from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.ai import UsageMetric


class MetricRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def increment_metric(
        self,
        *,
        company_id: int,
        metric_name: str,
        metric_date: date,
        amount: int = 1,
        estimated_cost: float = 0.0,
    ) -> UsageMetric:
        metric = self.db.scalar(
            select(UsageMetric).where(
                UsageMetric.company_id == company_id,
                UsageMetric.metric_name == metric_name,
                UsageMetric.metric_date == metric_date,
            )
        )
        if metric is None:
            metric = UsageMetric(
                company_id=company_id,
                metric_name=metric_name,
                metric_date=metric_date,
                metric_value=amount,
                estimated_cost=estimated_cost,
            )
            self.db.add(metric)
        else:
            metric.metric_value += amount
            metric.estimated_cost += estimated_cost

        self.db.flush()
        return metric
