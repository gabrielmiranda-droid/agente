from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.ai import AIAgent, HumanHandoff, KnowledgeItem, UsageMetric


class AIAgentRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_active_agent(self, company_id: int) -> AIAgent | None:
        return self.db.scalar(
            select(AIAgent)
            .where(AIAgent.company_id == company_id, AIAgent.active.is_(True))
            .order_by(AIAgent.updated_at.desc())
        )

    def create_agent(self, agent: AIAgent) -> AIAgent:
        self.db.add(agent)
        self.db.flush()
        return agent

    def list_agents(self, company_id: int) -> list[AIAgent]:
        return list(
            self.db.scalars(
                select(AIAgent)
                .where(AIAgent.company_id == company_id)
                .order_by(AIAgent.created_at.desc())
            ).all()
        )

    def create_handoff(self, handoff: HumanHandoff) -> HumanHandoff:
        self.db.add(handoff)
        self.db.flush()
        return handoff

    def get_active_handoff(self, conversation_id: int) -> HumanHandoff | None:
        return self.db.scalar(
            select(HumanHandoff).where(
                HumanHandoff.conversation_id == conversation_id,
                HumanHandoff.status == "active",
            )
        )

    def list_knowledge_items(self, company_id: int) -> list[KnowledgeItem]:
        return list(
            self.db.scalars(
                select(KnowledgeItem)
                .where(KnowledgeItem.company_id == company_id)
                .order_by(KnowledgeItem.updated_at.desc())
            ).all()
        )

    def create_knowledge_item(self, item: KnowledgeItem) -> KnowledgeItem:
        self.db.add(item)
        self.db.flush()
        return item

    def list_usage_metrics(self, company_id: int) -> list[UsageMetric]:
        return list(
            self.db.scalars(
                select(UsageMetric)
                .where(UsageMetric.company_id == company_id)
                .order_by(UsageMetric.metric_date.desc(), UsageMetric.metric_name.asc())
            ).all()
        )

