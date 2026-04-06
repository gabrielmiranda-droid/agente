from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.common import HealthResponse

router = APIRouter(tags=["health"])


def _build_health_response() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(status="ok", environment=settings.app_env)


@router.get("/", response_model=HealthResponse)
def root_health_check() -> HealthResponse:
    return _build_health_response()


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return _build_health_response()
