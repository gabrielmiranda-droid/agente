from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_company_id, require_dev, require_roles
from app.db.session import get_db
from app.repositories.company_repository import CompanyRepository
from app.schemas.auth import RegisterCompanyRequest
from app.schemas.company import CompanyResponse, CompanyUpdate
from app.services.auth_service import AuthService
from app.services.company_service import CompanyService

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("", response_model=list[CompanyResponse])
def list_companies(
    _: object = Depends(require_dev),
    db: Session = Depends(get_db),
) -> list[CompanyResponse]:
    items = CompanyRepository(db).list_all()
    return [CompanyResponse.model_validate(item) for item in items]


@router.post("", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
def create_company(
    payload: RegisterCompanyRequest,
    _: object = Depends(require_dev),
    db: Session = Depends(get_db),
) -> CompanyResponse:
    company = AuthService(db).register_company(payload)
    return CompanyResponse.model_validate(company)


@router.get("/me", response_model=CompanyResponse)
def get_my_company(
    company_id: int = Depends(get_current_company_id),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> CompanyResponse:
    company = CompanyRepository(db).get_by_id(company_id)
    return CompanyResponse.model_validate(company)


@router.get("/{company_id}", response_model=CompanyResponse)
def get_company_by_id(
    company_id: int,
    _: object = Depends(require_dev),
    db: Session = Depends(get_db),
) -> CompanyResponse:
    company = CompanyRepository(db).get_by_id(company_id)
    return CompanyResponse.model_validate(company)


@router.patch("/me", response_model=CompanyResponse)
def update_my_company(
    payload: CompanyUpdate,
    company_id: int = Depends(get_current_company_id),
    _: object = Depends(require_dev),
    db: Session = Depends(get_db),
) -> CompanyResponse:
    company = CompanyService(db).update_company(company_id, payload)
    return CompanyResponse.model_validate(company)


@router.patch("/{company_id}", response_model=CompanyResponse)
def update_company_by_id(
    company_id: int,
    payload: CompanyUpdate,
    _: object = Depends(require_dev),
    db: Session = Depends(get_db),
) -> CompanyResponse:
    company = CompanyService(db).update_company(company_id, payload)
    return CompanyResponse.model_validate(company)
