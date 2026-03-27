from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.company import Company


class CompanyRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, company: Company) -> Company:
        self.db.add(company)
        self.db.flush()
        return company

    def get_by_id(self, company_id: int) -> Company | None:
        return self.db.get(Company, company_id)

    def get_by_slug(self, slug: str) -> Company | None:
        return self.db.scalar(select(Company).where(Company.slug == slug))

    def list_all(self) -> list[Company]:
        return list(self.db.scalars(select(Company).order_by(Company.created_at.desc())).all())

