from celery.utils.log import get_task_logger

from app.core.config import get_settings
from app.db.session import get_session_factory
from app.services.conversation_service import ConversationService
from app.workers.celery_app import celery_app

logger = get_task_logger(__name__)
settings = get_settings()


@celery_app.task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=60,
    retry_jitter=True,
    max_retries=5,
    acks_late=True,
)
def process_incoming_message_task(self, *, company_id: int, message_id: int):
    logger.info(
        "celery_message_task_started",
        extra={"company_id": company_id, "message_id": message_id, "task_id": self.request.id},
    )
    session = get_session_factory()()
    try:
        service = ConversationService(session)
        result = service.process_incoming_message(company_id=company_id, message_id=message_id)
        logger.info(
            "celery_message_task_completed",
            extra={"company_id": company_id, "message_id": message_id, "task_id": self.request.id},
        )
        return result
    except Exception:
        logger.exception(
            "celery_message_task_failed",
            extra={"company_id": company_id, "message_id": message_id, "task_id": self.request.id},
        )
        session.rollback()
        raise
    finally:
        session.close()
