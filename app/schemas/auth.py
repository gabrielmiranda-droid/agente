from datetime import datetime

from pydantic import AliasChoices, BaseModel, ConfigDict, EmailStr, Field


class RegisterCompanyRequest(BaseModel):
    company_name: str = Field(min_length=2, max_length=255)
    company_slug: str = Field(min_length=2, max_length=120)
    dev_name: str = Field(
        min_length=2,
        max_length=255,
        validation_alias=AliasChoices("dev_name", "admin_name"),
        serialization_alias="dev_name",
    )
    dev_email: EmailStr = Field(
        validation_alias=AliasChoices("dev_email", "admin_email"),
        serialization_alias="dev_email",
    )
    dev_password: str = Field(
        min_length=8,
        max_length=128,
        validation_alias=AliasChoices("dev_password", "admin_password"),
        serialization_alias="dev_password",
    )


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    name: str
    email: EmailStr
    is_active: bool
    created_at: datetime


class CurrentUserResponse(UserResponse):
    role: str
