from app.core.config import get_settings
from app.core.logging_config import get_logger

logger = get_logger(__name__)


class MessageQueueService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def enqueue_incoming_message(self, *, company_id: int, message_id: int) -> str:
        from app.workers.tasks import process_incoming_message_task

        task = process_incoming_message_task.apply_async(
            kwargs={"company_id": company_id, "message_id": message_id},
            queue=self.settings.celery_task_queue_messages,
        )
        logger.info(
            "incoming_message_enqueued",
            extra={"company_id": company_id, "message_id": message_id, "celery_task_id": task.id},
        )
        return task.id
