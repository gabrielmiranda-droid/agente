from functools import lru_cache
from typing import Annotated, Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = Field(default="WhatsApp SaaS Platform", alias="APP_NAME")
    app_env: Literal["development", "staging", "production", "test"] = Field(
        default="development",
        alias="APP_ENV",
    )
    app_debug: bool = Field(default=False, alias="APP_DEBUG")
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8000, alias="PORT", ge=1, le=65535)
    api_v1_prefix: str = Field(default="/api/v1", alias="API_V1_PREFIX")
    database_url: str = Field(default="sqlite:///./saas_platform.db", alias="DATABASE_URL")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:3000"],
        alias="CORS_ORIGINS",
    )
    strict_config_validation: bool = Field(default=False, alias="STRICT_CONFIG_VALIDATION")

    secret_key: str = Field(default="change-me-in-production", alias="SECRET_KEY", min_length=16)
    access_token_expire_minutes: int = Field(default=30, alias="ACCESS_TOKEN_EXPIRE_MINUTES", ge=5, le=1440)
    refresh_token_expire_days: int = Field(default=7, alias="REFRESH_TOKEN_EXPIRE_DAYS", ge=1, le=90)

    default_history_limit: int = Field(default=12, alias="DEFAULT_HISTORY_LIMIT", ge=1, le=50)
    max_context_characters: int = Field(default=8000, alias="MAX_CONTEXT_CHARACTERS", ge=500, le=24000)
    max_response_characters: int = Field(default=900, alias="MAX_RESPONSE_CHARACTERS", ge=120, le=4000)
    default_empty_message_response: str = Field(
        default="Olá! Não consegui identificar sua mensagem. Pode enviar novamente com mais detalhes?",
        alias="DEFAULT_EMPTY_MESSAGE_RESPONSE",
    )
    default_greeting_message: str = Field(
        default="Olá! Sou o assistente virtual da {company_name}. Como posso ajudar?",
        alias="DEFAULT_GREETING_MESSAGE",
    )
    default_agent_style: str = Field(default="profissional, educado e objetivo", alias="DEFAULT_AGENT_STYLE")

    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-4.1-mini", alias="OPENAI_MODEL")
    openai_timeout_seconds: float = Field(default=30.0, alias="OPENAI_TIMEOUT_SECONDS", gt=0, le=120)
    openai_max_completion_tokens: int = Field(default=300, alias="OPENAI_MAX_COMPLETION_TOKENS", ge=50, le=4000)
    openai_default_temperature: float = Field(default=0.3, alias="OPENAI_DEFAULT_TEMPERATURE", ge=0, le=1.5)
    whatsapp_timeout_seconds: float = Field(default=15.0, alias="WHATSAPP_TIMEOUT_SECONDS", gt=0, le=120)

    external_retry_attempts: int = Field(default=3, alias="EXTERNAL_RETRY_ATTEMPTS", ge=1, le=5)
    external_retry_backoff_seconds: float = Field(default=0.8, alias="EXTERNAL_RETRY_BACKOFF_SECONDS", gt=0, le=10)
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    celery_broker_url: str = Field(default="redis://localhost:6379/0", alias="CELERY_BROKER_URL")
    celery_result_backend: str = Field(default="redis://localhost:6379/1", alias="CELERY_RESULT_BACKEND")
    celery_task_queue_messages: str = Field(default="messages", alias="CELERY_TASK_QUEUE_MESSAGES")
    idempotency_ttl_seconds: int = Field(default=3600, alias="IDEMPOTENCY_TTL_SECONDS", ge=60, le=86400)

    bootstrap_company_name: str | None = Field(default=None, alias="BOOTSTRAP_COMPANY_NAME")
    bootstrap_company_slug: str | None = Field(default=None, alias="BOOTSTRAP_COMPANY_SLUG")
    bootstrap_dev_name: str | None = Field(default=None, alias="BOOTSTRAP_DEV_NAME")
    bootstrap_dev_email: str | None = Field(default=None, alias="BOOTSTRAP_DEV_EMAIL")
    bootstrap_dev_password: str | None = Field(default=None, alias="BOOTSTRAP_DEV_PASSWORD")
    bootstrap_admin_name: str | None = Field(default=None, alias="BOOTSTRAP_ADMIN_NAME")
    bootstrap_admin_email: str | None = Field(default=None, alias="BOOTSTRAP_ADMIN_EMAIL")
    bootstrap_admin_password: str | None = Field(default=None, alias="BOOTSTRAP_ADMIN_PASSWORD")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def resolved_bootstrap_dev_name(self) -> str | None:
        return self.bootstrap_dev_name or self.bootstrap_admin_name

    @property
    def resolved_bootstrap_dev_email(self) -> str | None:
        return self.bootstrap_dev_email or self.bootstrap_admin_email

    @property
    def resolved_bootstrap_dev_password(self) -> str | None:
        return self.bootstrap_dev_password or self.bootstrap_admin_password


@lru_cache
def get_settings() -> Settings:
    return Settings()
