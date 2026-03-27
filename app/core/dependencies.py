from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.roles import ROLE_ATTENDANT, is_dev_role, normalize_role_name
from app.core.security import decode_token
from app.db.session import get_db
from app.models.auth import User
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = decode_token(token)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido") from exc

    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    user = UserRepository(db).get_by_id(int(user_id))
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário inválido")

    return user


def get_current_role_name(current_user: User = Depends(get_current_user)) -> str:
    return normalize_role_name(current_user.role.name if current_user.role else ROLE_ATTENDANT) or ROLE_ATTENDANT


def require_roles(*allowed_roles: str) -> Callable[[User], User]:
    normalized_allowed_roles = {normalize_role_name(role) for role in allowed_roles}

    def dependency(current_user: User = Depends(get_current_user)) -> User:
        current_role = normalize_role_name(current_user.role.name if current_user.role else "")
        if current_role not in normalized_allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permissão insuficiente")
        return current_user

    return dependency


def require_dev(current_user: User = Depends(get_current_user)) -> User:
    current_role = normalize_role_name(current_user.role.name if current_user.role else "")
    if not is_dev_role(current_role):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permissão insuficiente")
    return current_user


def get_current_company_id(current_user: User = Depends(get_current_user)) -> int:
    return current_user.company_id


def resolve_company_id(
    company_id: int | None = None,
    current_user: User = Depends(get_current_user),
) -> int:
    current_role = normalize_role_name(current_user.role.name if current_user.role else "")
    if is_dev_role(current_role):
        return company_id or current_user.company_id

    if company_id and company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permissão insuficiente")

    return current_user.company_id
