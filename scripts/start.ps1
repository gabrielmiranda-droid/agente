alembic upgrade head
uvicorn app.main:app --host $env:HOST --port $env:PORT
