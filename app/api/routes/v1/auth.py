from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.roles import ROLE_ATTENDANT, normalize_role_name
from app.db.session import get_db
from app.schemas.auth import (
    CurrentUserResponse,
    LoginRequest,
    RefreshTokenRequest,
    RegisterCompanyRequest,
    TokenResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register-company", status_code=status.HTTP_201_CREATED)
def register_company(payload: RegisterCompanyRequest, db: Session = Depends(get_db)):
    company = AuthService(db).register_company(payload)
    return {"detail": "Empresa criada com sucesso", "company_id": company.id}


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    return AuthService(db).authenticate(payload)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)) -> TokenResponse:
    return AuthService(db).refresh_access_token(payload.refresh_token)


@router.get("/me", response_model=CurrentUserResponse)
def me(current_user=Depends(get_current_user)) -> CurrentUserResponse:
    return CurrentUserResponse(
        id=current_user.id,
        company_id=current_user.company_id,
        name=current_user.name,
        email=current_user.email,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        role=normalize_role_name(current_user.role.name if current_user.role else ROLE_ATTENDANT) or ROLE_ATTENDANT,
    )
