from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes.health import router as health_router
from app.api.routes.v1.ai_agents import router as ai_agents_router
from app.api.routes.v1.auth import router as auth_router
from app.api.routes.v1.billing import router as billing_router
from app.api.routes.v1.business import router as business_router
from app.api.routes.v1.business_hours import router as business_hours_router
from app.api.routes.v1.catalog import router as catalog_router
from app.api.routes.v1.companies import router as companies_router
from app.api.routes.v1.conversations import router as conversations_router
from app.api.routes.v1.knowledge import router as knowledge_router
from app.api.routes.v1.metrics import router as metrics_router
from app.api.routes.v1.operations import router as operations_router
from app.api.routes.v1.promotions import router as promotions_router
from app.api.routes.v1.users import router as users_router
from app.api.routes.v1.webhooks import router as webhooks_router
from app.api.routes.v1.whatsapp_instances import router as whatsapp_router
from app.core.config import get_settings
from app.core.exceptions import ApplicationError, AuthenticationError, NotFoundError, ValidationError
from app.core.logging_config import configure_logging, get_logger
from app.db.init_db import bootstrap_initial_company, ensure_database_schema, seed_base_data
from app.db.session import get_engine, get_session_factory
from app.middlewares.request_logging import RequestLoggingMiddleware

configure_logging(get_settings().log_level)
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    logger.info("application_startup", extra={"app_name": settings.app_name, "environment": settings.app_env})
    ensure_database_schema(get_engine())
    session = get_session_factory()()
    try:
        seed_base_data(session)
        bootstrap_initial_company(session)
    finally:
        session.close()
    yield
    logger.info("application_shutdown")


def create_application() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, debug=settings.app_debug, lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestLoggingMiddleware)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
        logger.warning("request_validation_error", extra={"errors": exc.errors()})
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": "Payload invalido", "errors": exc.errors()},
        )

    @app.exception_handler(AuthenticationError)
    async def authentication_exception_handler(_: Request, exc: AuthenticationError) -> JSONResponse:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"detail": str(exc)})

    @app.exception_handler(NotFoundError)
    async def not_found_exception_handler(_: Request, exc: NotFoundError) -> JSONResponse:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"detail": str(exc)})

    @app.exception_handler(ValidationError)
    async def domain_validation_exception_handler(_: Request, exc: ValidationError) -> JSONResponse:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"detail": str(exc)})

    @app.exception_handler(ApplicationError)
    async def application_exception_handler(_: Request, exc: ApplicationError) -> JSONResponse:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"detail": str(exc)})

    @app.exception_handler(Exception)
    async def generic_exception_handler(_: Request, exc: Exception) -> JSONResponse:
        logger.exception("unhandled_exception", extra={"error_type": exc.__class__.__name__})
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"detail": "Erro interno do servidor"})

    app.include_router(health_router)
    app.include_router(auth_router, prefix=settings.api_v1_prefix)
    app.include_router(companies_router, prefix=settings.api_v1_prefix)
    app.include_router(users_router, prefix=settings.api_v1_prefix)
    app.include_router(whatsapp_router, prefix=settings.api_v1_prefix)
    app.include_router(ai_agents_router, prefix=settings.api_v1_prefix)
    app.include_router(knowledge_router, prefix=settings.api_v1_prefix)
    app.include_router(business_router, prefix=settings.api_v1_prefix)
    app.include_router(catalog_router, prefix=settings.api_v1_prefix)
    app.include_router(business_hours_router, prefix=settings.api_v1_prefix)
    app.include_router(promotions_router, prefix=settings.api_v1_prefix)
    app.include_router(conversations_router, prefix=settings.api_v1_prefix)
    app.include_router(metrics_router, prefix=settings.api_v1_prefix)
    app.include_router(operations_router, prefix=settings.api_v1_prefix)
    app.include_router(billing_router, prefix=settings.api_v1_prefix)
    app.include_router(webhooks_router, prefix=settings.api_v1_prefix)
    return app


app = create_application()
