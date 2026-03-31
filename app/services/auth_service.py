from sqlalchemy.orm import Session

from app.core.exceptions import AuthenticationError, ValidationError
from app.core.roles import ROLE_ATTENDANT, ROLE_CLIENT, normalize_role_name
from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.models.ai import AIAgent
from app.models.auth import User
from app.models.billing import Subscription
from app.models.company import Company
from app.repositories.billing_repository import BillingRepository
from app.repositories.company_repository import CompanyRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterCompanyRequest, TokenResponse
from app.utils.helpers import build_delivery_system_prompt, build_slug


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.user_repository = UserRepository(db)
        self.company_repository = CompanyRepository(db)
        self.billing_repository = BillingRepository(db)

    def register_company(self, payload: RegisterCompanyRequest) -> Company:
        if self.user_repository.get_by_email(payload.dev_email.lower()):
            raise ValidationError("E-mail ja cadastrado")

        slug = build_slug(payload.company_slug)
        if self.company_repository.get_by_slug(slug):
            raise ValidationError("Slug da empresa ja existe")

        client_role = self.user_repository.get_role_by_name(ROLE_CLIENT)
        free_plan = self.billing_repository.get_plan_by_code("free")
        if not client_role or not free_plan:
            raise ValidationError("Base inicial do sistema nao foi preparada")

        company = Company(
            name=payload.company_name,
            slug=slug,
            status="active",
            agent_tone="profissional, educado e objetivo",
            absence_message="No momento estamos fora do horario de atendimento.",
        )
        self.company_repository.create(company)
        self.db.add(Subscription(company_id=company.id, plan_id=free_plan.id, status="active"))
        self.db.flush()

        user = User(
            company_id=company.id,
            role_id=client_role.id,
            name=payload.dev_name,
            email=payload.dev_email.lower(),
            password_hash=hash_password(payload.dev_password),
            is_active=True,
        )
        self.user_repository.create(user)
        self.db.add(
            AIAgent(
                company_id=company.id,
                name="Agente Principal",
                model="gpt-4.1-mini",
                system_prompt=build_delivery_system_prompt(company.name, company.agent_tone),
                temperature=0.3,
                max_context_messages=12,
                active=True,
            )
        )
        self.db.commit()
        self.db.refresh(company)
        return company

    def authenticate(self, payload: LoginRequest) -> TokenResponse:
        user = self.user_repository.get_by_email(payload.email.lower())
        if not user or not verify_password(payload.password, user.password_hash):
            raise AuthenticationError("Credenciais invalidas")
        if not user.is_active:
            raise AuthenticationError("Usuario inativo")

        self.user_repository.mark_login(user)
        self.db.commit()

        role_name = normalize_role_name(user.role.name if user.role else ROLE_ATTENDANT) or ROLE_ATTENDANT
        return TokenResponse(
            access_token=create_access_token(str(user.id), user.company_id, role_name),
            refresh_token=create_refresh_token(str(user.id), user.company_id, role_name),
        )

    def refresh_access_token(self, refresh_token: str) -> TokenResponse:
        try:
            payload = decode_token(refresh_token)
        except Exception as exc:
            raise AuthenticationError("Refresh token invalido") from exc

        if payload.get("type") != "refresh":
            raise AuthenticationError("Refresh token invalido")

        user = self.user_repository.get_by_id(int(payload["sub"]))
        if not user or not user.is_active:
            raise AuthenticationError("Usuario invalido")

        role_name = normalize_role_name(user.role.name if user.role else ROLE_ATTENDANT) or ROLE_ATTENDANT
        return TokenResponse(
            access_token=create_access_token(str(user.id), user.company_id, role_name),
            refresh_token=create_refresh_token(str(user.id), user.company_id, role_name),
        )
