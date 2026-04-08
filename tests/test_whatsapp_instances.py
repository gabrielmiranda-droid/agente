from app.db.session import get_session_factory
from app.repositories.user_repository import UserRepository


def _register_company(client, *, company_name: str, company_slug: str, email: str, password: str = "ChangeMe123!") -> int:
    response = client.post(
        "/api/v1/auth/register-company",
        json={
            "company_name": company_name,
            "company_slug": company_slug,
            "admin_name": f"Admin {company_name}",
            "admin_email": email,
            "admin_password": password,
        },
    )
    assert response.status_code == 201
    return response.json()["company_id"]


def _promote_user_to_dev(email: str) -> None:
    session = get_session_factory()()
    try:
        repository = UserRepository(session)
        user = repository.get_by_email(email)
        dev_role = repository.get_role_by_name("dev")
        assert user is not None
        assert dev_role is not None
        user.role_id = dev_role.id
        session.commit()
    finally:
        session.close()


def _auth_header(client, *, email: str, password: str = "ChangeMe123!") -> dict[str, str]:
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def _instance_payload(*, name: str, instance_name: str, company_id: int | None = None) -> dict:
    payload = {
        "name": name,
        "instance_name": instance_name,
        "api_base_url": "https://evolution.example.com",
        "api_key": "secret-key",
        "phone_number": "5511999999999",
        "webhook_secret": "hook-secret",
        "active": True,
    }
    if company_id is not None:
        payload["company_id"] = company_id
    return payload


def test_create_instance_registers_the_requested_company(client) -> None:
    company_a_id = _register_company(
        client,
        company_name="Empresa Alpha",
        company_slug="empresa-alpha",
        email="alpha@empresa.com",
    )
    company_b_id = _register_company(
        client,
        company_name="Empresa Beta",
        company_slug="empresa-beta",
        email="beta@empresa.com",
    )
    _promote_user_to_dev("alpha@empresa.com")
    headers = _auth_header(client, email="alpha@empresa.com")

    create_response = client.post(
        "/api/v1/whatsapp-instances",
        headers=headers,
        json=_instance_payload(name="Canal Beta", instance_name="tenant-beta", company_id=company_b_id),
    )

    assert create_response.status_code == 201
    assert create_response.json()["company_id"] == company_b_id

    company_b_instances = client.get(f"/api/v1/whatsapp-instances?company_id={company_b_id}", headers=headers)
    assert company_b_instances.status_code == 200
    assert [item["instance_name"] for item in company_b_instances.json()] == ["tenant-beta"]

    company_a_instances = client.get(f"/api/v1/whatsapp-instances?company_id={company_a_id}", headers=headers)
    assert company_a_instances.status_code == 200
    assert company_a_instances.json() == []


def test_create_instance_rejects_conflicting_company_scope(client) -> None:
    company_a_id = _register_company(
        client,
        company_name="Empresa Escopo A",
        company_slug="empresa-escopo-a",
        email="escopo-a@empresa.com",
    )
    company_b_id = _register_company(
        client,
        company_name="Empresa Escopo B",
        company_slug="empresa-escopo-b",
        email="escopo-b@empresa.com",
    )
    _promote_user_to_dev("escopo-a@empresa.com")
    headers = _auth_header(client, email="escopo-a@empresa.com")

    response = client.post(
        f"/api/v1/whatsapp-instances?company_id={company_a_id}",
        headers=headers,
        json=_instance_payload(name="Canal Conflito", instance_name="tenant-conflito", company_id=company_b_id),
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "company_id do corpo difere do company_id da query"


def test_create_instance_respects_plan_limit_for_each_company(client) -> None:
    company_id = _register_company(
        client,
        company_name="Empresa Limite",
        company_slug="empresa-limite",
        email="limite@empresa.com",
    )
    _promote_user_to_dev("limite@empresa.com")
    headers = _auth_header(client, email="limite@empresa.com")

    first_response = client.post(
        "/api/v1/whatsapp-instances",
        headers=headers,
        json=_instance_payload(name="Canal Principal", instance_name="tenant-limite-1", company_id=company_id),
    )
    assert first_response.status_code == 201

    second_response = client.post(
        "/api/v1/whatsapp-instances",
        headers=headers,
        json=_instance_payload(name="Canal Reserva", instance_name="tenant-limite-2", company_id=company_id),
    )

    assert second_response.status_code == 400
    assert "limite de 1 instancia(s)" in second_response.json()["detail"]
