from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.roles import ROLE_CLIENT, ROLE_DEV
from app.core.security import hash_password
from app.db.base import Base
from app.models.ai import AIAgent
from app.models.auth import Role, User
from app.models.billing import Plan, Subscription
from app.models.company import Company
from app.utils.helpers import build_delivery_system_prompt

DEFAULT_ROLES = (ROLE_DEV, ROLE_CLIENT)
DEFAULT_PLANS = (
    ("free", "Free", 1000, 2, 1),
    ("basic", "Basic", 10000, 10, 3),
    ("pro", "Pro", 100000, 100, 10),
)


def ensure_database_schema(engine: Engine) -> None:
    Base.metadata.create_all(bind=engine)


def _get_or_create_role(db: Session, role_name: str) -> Role:
    role = db.query(Role).filter(Role.name == role_name).first()
    if role:
        return role
    role = Role(name=role_name, description=f"Perfil {role_name}")
    db.add(role)
    db.flush()
    return role


def _migrate_legacy_roles(db: Session) -> None:
    dev_role = _get_or_create_role(db, ROLE_DEV)
    client_role = _get_or_create_role(db, ROLE_CLIENT)

    legacy_admin = db.query(Role).filter(Role.name == "admin").first()
    legacy_manager = db.query(Role).filter(Role.name == "manager").first()
    legacy_attendant = db.query(Role).filter(Role.name == "attendant").first()

    if legacy_admin:
        for user in db.query(User).filter(User.role_id == legacy_admin.id).all():
            user.role_id = dev_role.id

    if legacy_manager:
        for user in db.query(User).filter(User.role_id == legacy_manager.id).all():
            user.role_id = client_role.id

    if legacy_attendant and legacy_attendant.id != client_role.id:
        for user in db.query(User).filter(User.role_id == legacy_attendant.id).all():
            user.role_id = client_role.id


def seed_base_data(db: Session) -> None:
    for role_name in DEFAULT_ROLES:
        _get_or_create_role(db, role_name)

    _migrate_legacy_roles(db)

    existing_plans = {plan.code for plan in db.query(Plan).all()}
    for code, name, messages, users, instances in DEFAULT_PLANS:
        if code not in existing_plans:
            db.add(
                Plan(
                    code=code,
                    name=name,
                    max_messages_per_month=messages,
                    max_users=users,
                    max_whatsapp_instances=instances,
                )
            )

    db.commit()


def bootstrap_initial_company(db: Session) -> None:
    settings = get_settings()
    dev_name = settings.resolved_bootstrap_dev_name
    dev_email = settings.resolved_bootstrap_dev_email
    dev_password = settings.resolved_bootstrap_dev_password

    required = [
        settings.bootstrap_company_name,
        settings.bootstrap_company_slug,
        dev_name,
        dev_email,
        dev_password,
    ]
    if not all(required):
        return

    company = db.query(Company).filter(Company.slug == settings.bootstrap_company_slug).first()
    if company:
        return

    dev_role = db.query(Role).filter(Role.name == ROLE_DEV).first()
    free_plan = db.query(Plan).filter(Plan.code == "free").first()
    if not dev_role or not free_plan:
        return

    company = Company(
        name=settings.bootstrap_company_name,
        slug=settings.bootstrap_company_slug,
        status="active",
        agent_tone=settings.default_agent_style,
        absence_message="No momento estamos fora do horário de atendimento.",
    )
    db.add(company)
    db.flush()

    db.add(Subscription(company_id=company.id, plan_id=free_plan.id, status="active"))
    user = User(
        company_id=company.id,
        role_id=dev_role.id,
        name=dev_name,
        email=dev_email.lower(),
        password_hash=hash_password(dev_password),
        is_active=True,
    )
    db.add(user)
    db.flush()

    db.add(
        AIAgent(
            company_id=company.id,
            name="Agente Principal",
            model=settings.openai_model,
            system_prompt=build_delivery_system_prompt(company.name, company.agent_tone or settings.default_agent_style),
            temperature=settings.openai_default_temperature,
            max_context_messages=settings.default_history_limit,
            active=True,
        )
    )
    db.commit()
