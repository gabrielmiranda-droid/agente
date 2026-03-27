from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ValidationError
from app.models.company import Company
from app.models.whatsapp import WhatsAppInstance
from app.repositories.company_repository import CompanyRepository
from app.repositories.whatsapp_repository import WhatsAppInstanceRepository
from app.schemas.company import CompanyCreate, CompanyUpdate
from app.schemas.whatsapp import WhatsAppInstanceCreate
from app.utils.helpers import build_slug


class CompanyService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.company_repository = CompanyRepository(db)
        self.instance_repository = WhatsAppInstanceRepository(db)

    def create_company(self, payload: CompanyCreate) -> Company:
        slug = build_slug(payload.slug)
        if self.company_repository.get_by_slug(slug):
            raise ValidationError("Slug ja utilizado")

        if payload.status not in {"active", "paused", "inactive"}:
            raise ValidationError("Status da empresa invalido")

        company = Company(
            name=payload.name.strip(),
            slug=slug,
            status=payload.status,
            agent_tone=payload.agent_tone,
            default_system_prompt=payload.default_system_prompt,
            business_hours=payload.business_hours,
            absence_message=payload.absence_message,
            settings=payload.settings,
        )
        self.company_repository.create(company)
        self.db.commit()
        self.db.refresh(company)
        return company

    def update_company(self, company_id: int, payload: CompanyUpdate) -> Company:
        company = self.company_repository.get_by_id(company_id)
        if not company:
            raise NotFoundError("Empresa nao encontrada")

        updates = payload.model_dump(exclude_unset=True)

        if "status" in updates and updates["status"] not in {"active", "paused", "inactive"}:
            raise ValidationError("Status da empresa invalido")

        if "name" in updates and updates["name"] is not None:
            normalized_name = updates["name"].strip()
            if len(normalized_name) < 2:
                raise ValidationError("Nome da empresa invalido")
            updates["name"] = normalized_name

        for field, value in updates.items():
            setattr(company, field, value)

        self.db.commit()
        self.db.refresh(company)
        return company

    def create_whatsapp_instance(self, company_id: int, payload: WhatsAppInstanceCreate) -> WhatsAppInstance:
        if self.instance_repository.get_by_instance_name(payload.instance_name):
            raise ValidationError("instance_name ja utilizado")

        instance = WhatsAppInstance(
            company_id=company_id,
            name=payload.name,
            instance_name=payload.instance_name,
            api_base_url=payload.api_base_url,
            api_key=payload.api_key,
            phone_number=payload.phone_number,
            webhook_secret=payload.webhook_secret,
            active=payload.active,
        )
        self.instance_repository.create(instance)
        self.db.commit()
        self.db.refresh(instance)
        return instance
