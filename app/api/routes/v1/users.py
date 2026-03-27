from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_role_name, require_roles, resolve_company_id
from app.core.exceptions import ValidationError
from app.core.roles import ROLE_ATTENDANT, ROLE_DEV, is_dev_role, normalize_role_name
from app.core.security import hash_password
from app.db.session import get_db
from app.models.auth import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserResponse])
def list_users(
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> list[UserResponse]:
    users = UserRepository(db).list_by_company(company_id)
    return [
        UserResponse(
            id=user.id,
            company_id=user.company_id,
            name=user.name,
            email=user.email,
            role=normalize_role_name(user.role.name if user.role else ROLE_ATTENDANT) or ROLE_ATTENDANT,
            is_active=user.is_active,
            created_at=user.created_at,
        )
        for user in users
    ]


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    company_id: int = Depends(resolve_company_id),
    current_role: str = Depends(get_current_role_name),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> UserResponse:
    normalized_role = normalize_role_name(payload.role) or ROLE_ATTENDANT
    if not is_dev_role(current_role) and normalized_role != ROLE_ATTENDANT:
        raise ValidationError("O perfil da empresa só pode criar atendentes")

    repository = UserRepository(db)
    role = repository.get_role_by_name(normalized_role)
    if role is None:
        raise ValidationError("Role inválida")
    if repository.get_by_email(payload.email.lower()):
        raise ValidationError("E-mail já cadastrado")

    user = User(
        company_id=company_id,
        role_id=role.id,
        name=payload.name,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        is_active=True,
    )
    repository.create(user)
    db.commit()
    db.refresh(user)
    return UserResponse(
        id=user.id,
        company_id=user.company_id,
        name=user.name,
        email=user.email,
        role=normalize_role_name(user.role.name if user.role else ROLE_ATTENDANT) or ROLE_ATTENDANT,
        is_active=user.is_active,
        created_at=user.created_at,
    )
