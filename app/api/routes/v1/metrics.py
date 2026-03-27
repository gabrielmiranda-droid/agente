from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles, resolve_company_id
from app.db.session import get_db
from app.repositories.ai_repository import AIAgentRepository
from app.schemas.ai import UsageMetricResponse

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("", response_model=list[UsageMetricResponse])
def list_metrics(
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> list[UsageMetricResponse]:
    items = AIAgentRepository(db).list_usage_metrics(company_id)
    return [UsageMetricResponse.model_validate(item) for item in items]
