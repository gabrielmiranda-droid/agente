#!/usr/bin/env sh
set -e

celery -A app.workers.celery_app.celery_app worker --loglevel=INFO --queues="${CELERY_TASK_QUEUE_MESSAGES:-messages}"
