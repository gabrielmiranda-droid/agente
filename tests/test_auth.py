def test_register_and_login_flow(client) -> None:
    register_response = client.post(
        "/api/v1/auth/register-company",
        json={
            "company_name": "Empresa XPTO",
            "company_slug": "empresa-xpto",
            "admin_name": "Admin XPTO",
            "admin_email": "admin@xpto.com",
            "admin_password": "ChangeMe123!",
        },
    )
    assert register_response.status_code == 201

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@xpto.com", "password": "ChangeMe123!"},
    )
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()
