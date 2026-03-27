from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.whatsapp import WhatsAppInstance


class WhatsAppInstanceRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, instance: WhatsAppInstance) -> WhatsAppInstance:
        self.db.add(instance)
        self.db.flush()
        return instance

    def get_by_id(self, instance_id: int) -> WhatsAppInstance | None:
        return self.db.get(WhatsAppInstance, instance_id)

    def get_by_instance_name(self, instance_name: str) -> WhatsAppInstance | None:
        return self.db.scalar(select(WhatsAppInstance).where(WhatsAppInstance.instance_name == instance_name))

    def list_by_company(self, company_id: int) -> list[WhatsAppInstance]:
        return list(
            self.db.scalars(
                select(WhatsAppInstance)
                .where(WhatsAppInstance.company_id == company_id)
                .order_by(WhatsAppInstance.created_at.desc())
            ).all()
        )

