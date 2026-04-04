from app.db.session import get_session_factory
from app.models.whatsapp import WhatsAppInstance
from app.services.idempotency_service import IdempotencyService
from app.services.message_queue_service import MessageQueueService


def _auth_header(client):
    client.post(
        "/api/v1/auth/register-company",
        json={
          "company_name": "Empresa Bot",
          "company_slug": "empresa-bot",
          "admin_name": "Admin Bot",
          "admin_email": "admin@bot.com",
          "admin_password": "ChangeMe123!"
        },
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@bot.com", "password": "ChangeMe123!"},
    ).json()
    return {"Authorization": f"Bearer {login['access_token']}"}


def _create_instance_for_company(company_id: int = 1) -> None:
    session = get_session_factory()()
    try:
        session.add(
            WhatsAppInstance(
                company_id=company_id,
                name="Principal",
                instance_name="tenant-main",
                api_base_url="http://evolution.local",
                api_key="secret",
                phone_number="5511999999999",
                webhook_secret="hook-secret",
                active=True,
            )
        )
        session.commit()
    finally:
        session.close()


def test_webhook_processes_message(client, monkeypatch) -> None:
    _auth_header(client)
    _create_instance_for_company()

    monkeypatch.setattr(IdempotencyService, "acquire", lambda self, key: True)
    monkeypatch.setattr(MessageQueueService, "enqueue_incoming_message", lambda self, company_id, message_id: "task-1")

    response = client.post(
        "/api/v1/webhooks/evolution",
        headers={"x-webhook-secret": "hook-secret"},
        json={
            "event": "messages.upsert",
            "instance": "tenant-main",
            "data": {
                "key": {
                    "remoteJid": "5511999999999@s.whatsapp.net",
                    "fromMe": False,
                    "id": "IN-1",
                },
                "pushName": "Cliente",
                "message": {"conversation": "Ola"},
            },
        },
    )

    assert response.status_code == 200
    assert response.json()["status"] == "accepted"
    assert response.json()["task_id"] == "task-1"


def test_webhook_ignores_group_message(client, monkeypatch) -> None:
    _auth_header(client)
    _create_instance_for_company()

    monkeypatch.setattr(IdempotencyService, "acquire", lambda self, key: True)
    monkeypatch.setattr(MessageQueueService, "enqueue_incoming_message", lambda self, company_id, message_id: "task-1")

    response = client.post(
        "/api/v1/webhooks/evolution",
        headers={"x-webhook-secret": "hook-secret"},
        json={
            "event": "messages.upsert",
            "instance": "tenant-main",
            "data": {
                "key": {
                    "remoteJid": "120363000000000000@g.us",
                    "fromMe": False,
                    "id": "IN-2",
                },
                "pushName": "Grupo Teste",
                "message": {"conversation": "ola grupo"},
            },
        },
    )

    assert response.status_code == 200
    assert response.json()["status"] == "ignored"
