from collections import Counter

from sqlalchemy.orm import Session

from app.models.ai import KnowledgeItem
from app.repositories.ai_repository import AIAgentRepository
from app.schemas.ai import KnowledgeItemCreate
from app.utils.helpers import clean_text, truncate_text


class KnowledgeService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.ai_repository = AIAgentRepository(db)

    def create_item(self, company_id: int, payload: KnowledgeItemCreate) -> KnowledgeItem:
        item = KnowledgeItem(
            company_id=company_id,
            title=payload.title,
            content=payload.content,
            category=payload.category,
            active=payload.active,
        )
        self.ai_repository.create_knowledge_item(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def list_items(self, company_id: int) -> list[KnowledgeItem]:
        return self.ai_repository.list_knowledge_items(company_id)

    def build_relevant_context(self, company_id: int, query: str, limit: int = 3) -> list[str]:
        items = [item for item in self.ai_repository.list_knowledge_items(company_id) if item.active]
        if not items:
            return []

        query_terms = [term for term in clean_text(query).lower().split(" ") if len(term) > 2]
        if not query_terms:
            return [truncate_text(item.content, 400) for item in items[:limit]]

        scored: list[tuple[int, KnowledgeItem]] = []
        for item in items:
            haystack = f"{item.title} {item.content} {item.category or ''}".lower()
            score = sum(1 for term in query_terms if term in haystack)
            if score > 0:
                scored.append((score, item))

        scored.sort(key=lambda entry: entry[0], reverse=True)
        selected = [item for _, item in scored[:limit]]
        return [truncate_text(item.content, 400) for item in selected]
