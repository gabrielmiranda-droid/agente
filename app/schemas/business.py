from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict, Field


class BusinessProfileUpdate(BaseModel):
    business_name: str = Field(min_length=2, max_length=255)
    phone: str | None = Field(default=None, max_length=30)
    address: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=120)
    neighborhood: str | None = Field(default=None, max_length=120)
    delivery_fee: float | None = Field(default=None, ge=0)
    estimated_delivery_time: str | None = Field(default=None, max_length=120)
    accepts_pickup: bool = True
    payment_methods: list[str] = Field(default_factory=list)
    welcome_message: str | None = None
    out_of_hours_message: str | None = None


class BusinessProfileResponse(BusinessProfileUpdate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime


class ProductCategoryBase(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    active: bool = True


class ProductCategoryCreate(ProductCategoryBase):
    pass


class ProductCategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    active: bool | None = None


class ProductCategoryResponse(ProductCategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime


class ProductBase(BaseModel):
    category_id: int | None = None
    name: str = Field(min_length=2, max_length=255)
    description: str | None = None
    price: float = Field(ge=0)
    promotional_price: float | None = Field(default=None, ge=0)
    active: bool = True
    featured: bool = False
    display_order: int = Field(default=0, ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    category_id: int | None = None
    name: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None
    price: float | None = Field(default=None, ge=0)
    promotional_price: float | None = Field(default=None, ge=0)
    active: bool | None = None
    featured: bool | None = None
    display_order: int | None = Field(default=None, ge=0)


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime


class ProductAddonBase(BaseModel):
    product_id: int
    name: str = Field(min_length=2, max_length=255)
    price: float = Field(ge=0)
    active: bool = True


class ProductAddonCreate(ProductAddonBase):
    pass


class ProductAddonUpdate(BaseModel):
    product_id: int | None = None
    name: str | None = Field(default=None, min_length=2, max_length=255)
    price: float | None = Field(default=None, ge=0)
    active: bool | None = None


class ProductAddonResponse(ProductAddonBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime


class BusinessHourBase(BaseModel):
    day_of_week: int = Field(ge=0, le=6)
    open_time: time
    close_time: time
    active: bool = True


class BusinessHourCreate(BusinessHourBase):
    pass


class BusinessHourUpdate(BaseModel):
    day_of_week: int | None = Field(default=None, ge=0, le=6)
    open_time: time | None = None
    close_time: time | None = None
    active: bool | None = None


class BusinessHourResponse(BusinessHourBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime


class PromotionBase(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    description: str | None = None
    active: bool = True
    start_date: date | None = None
    end_date: date | None = None


class PromotionCreate(PromotionBase):
    pass


class PromotionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None
    active: bool | None = None
    start_date: date | None = None
    end_date: date | None = None


class PromotionResponse(PromotionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime
