from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.auth import Role, User


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.get(User, user_id)

    def get_by_email(self, email: str) -> User | None:
        return self.db.scalar(select(User).where(User.email == email.lower()))

    def list_by_company(self, company_id: int) -> list[User]:
        return list(
            self.db.scalars(
                select(User).where(User.company_id == company_id).order_by(User.created_at.desc())
            ).all()
        )

    def get_role_by_name(self, role_name: str) -> Role | None:
        return self.db.scalar(select(Role).where(Role.name == role_name))

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.flush()
        return user

    def delete(self, user: User) -> None:
        self.db.delete(user)
        self.db.flush()

    def mark_login(self, user: User) -> None:
        user.last_login_at = datetime.now(UTC)
        self.db.flush()
