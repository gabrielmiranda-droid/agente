from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    db_path = tmp_path / "test.db"

    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path.as_posix()}")
    monkeypatch.setenv("SECRET_KEY", "test-secret-key-123456789")
    monkeypatch.setenv("BOOTSTRAP_COMPANY_NAME", "")
    monkeypatch.setenv("BOOTSTRAP_COMPANY_SLUG", "")
    monkeypatch.setenv("BOOTSTRAP_ADMIN_NAME", "")
    monkeypatch.setenv("BOOTSTRAP_ADMIN_EMAIL", "")
    monkeypatch.setenv("BOOTSTRAP_ADMIN_PASSWORD", "")

    from app.core.config import get_settings
    from app.db.session import reset_database_connections

    get_settings.cache_clear()
    reset_database_connections()

    from app.main import create_application

    app = create_application()
    with TestClient(app) as test_client:
        yield test_client

    reset_database_connections()
    get_settings.cache_clear()
