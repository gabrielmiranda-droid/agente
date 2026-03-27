#!/usr/bin/env sh
set -e

alembic upgrade head
uvicorn app.main:app --host "${HOST:-0.0.0.0}" --port "${PORT:-8000}"
