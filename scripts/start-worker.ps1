$queue = if ($env:CELERY_TASK_QUEUE_MESSAGES) { $env:CELERY_TASK_QUEUE_MESSAGES } else { "messages" }
celery -A app.workers.celery_app.celery_app worker --pool=solo --loglevel=INFO --queues=$queue
