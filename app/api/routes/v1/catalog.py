from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles, resolve_company_id
from app.db.session import get_db
from app.schemas.business import (
    ProductAddonCreate,
    ProductAddonResponse,
    ProductAddonUpdate,
    ProductCategoryCreate,
    ProductCategoryResponse,
    ProductCategoryUpdate,
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)
from app.services.business_service import BusinessService

router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get("/categories", response_model=list[ProductCategoryResponse])
def list_categories(
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> list[ProductCategoryResponse]:
    return [ProductCategoryResponse.model_validate(item) for item in BusinessService(db).list_categories(company_id)]


@router.post("/categories", response_model=ProductCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: ProductCategoryCreate,
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> ProductCategoryResponse:
    item = BusinessService(db).create_category(company_id, payload)
    return ProductCategoryResponse.model_validate(item)


@router.patch("/categories/{category_id}", response_model=ProductCategoryResponse)
def update_category(
    category_id: int,
    payload: ProductCategoryUpdate,
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> ProductCategoryResponse:
    item = BusinessService(db).update_category(company_id, category_id, payload)
    return ProductCategoryResponse.model_validate(item)


@router.get("/products", response_model=list[ProductResponse])
def list_products(
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> list[ProductResponse]:
    return [ProductResponse.model_validate(item) for item in BusinessService(db).list_products(company_id)]


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> ProductResponse:
    item = BusinessService(db).create_product(company_id, payload)
    return ProductResponse.model_validate(item)


@router.patch("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> ProductResponse:
    item = BusinessService(db).update_product(company_id, product_id, payload)
    return ProductResponse.model_validate(item)


@router.get("/addons", response_model=list[ProductAddonResponse])
def list_addons(
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> list[ProductAddonResponse]:
    return [ProductAddonResponse.model_validate(item) for item in BusinessService(db).list_addons(company_id)]


@router.post("/addons", response_model=ProductAddonResponse, status_code=status.HTTP_201_CREATED)
def create_addon(
    payload: ProductAddonCreate,
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> ProductAddonResponse:
    item = BusinessService(db).create_addon(company_id, payload)
    return ProductAddonResponse.model_validate(item)


@router.patch("/addons/{addon_id}", response_model=ProductAddonResponse)
def update_addon(
    addon_id: int,
    payload: ProductAddonUpdate,
    company_id: int = Depends(resolve_company_id),
    _: object = Depends(require_roles("dev", "attendant")),
    db: Session = Depends(get_db),
) -> ProductAddonResponse:
    item = BusinessService(db).update_addon(company_id, addon_id, payload)
    return ProductAddonResponse.model_validate(item)
