from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_dev, resolve_company_id
from app.db.session import get_db
from app.schemas.ai import AIAgentCreate, AIAgentResponse
from app.services.agent_service import AgentService

router = APIRouter(prefix="/ai-agents", tags=["ai-agents"])


@router.get("", response_model=list[AIAgentResponse])
def list_agents(
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_dev),
    db: Session = Depends(get_db),
) -> list[AIAgentResponse]:
    return [AIAgentResponse.model_validate(item) for item in AgentService(db).list_agents(company_id)]


@router.post("", response_model=AIAgentResponse, status_code=status.HTTP_201_CREATED)
def create_agent(
    payload: AIAgentCreate,
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_dev),
    db: Session = Depends(get_db),
) -> AIAgentResponse:
    agent = AgentService(db).create_agent(company_id, payload)
    return AIAgentResponse.model_validate(agent)
