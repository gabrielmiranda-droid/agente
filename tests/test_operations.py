from app.db.session import get_session_factory
from app.models.operations import Order, OrderItem


def _auth_header(client):
    client.post(
        "/api/v1/auth/register-company",
        json={
            "company_name": "Empresa Operacional",
            "company_slug": "empresa-operacional",
            "admin_name": "Admin Operacional",
            "admin_email": "admin@operacional.com",
            "admin_password": "ChangeMe123!",
        },
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@operacional.com", "password": "ChangeMe123!"},
    ).json()
    return {"Authorization": f"Bearer {login['access_token']}"}


def test_confirmed_order_generates_cashier_and_kitchen_print_jobs(client) -> None:
    headers = _auth_header(client)
    session = get_session_factory()()
    try:
        order = Order(
            company_id=1,
            code="PED-100",
            fulfillment_type="pickup",
            customer_name="Cliente Balcao",
            customer_phone="5511999999999",
            payment_method="pix",
            total_amount=42,
            subtotal=42,
        )
        session.add(order)
        session.flush()
        session.add(
            OrderItem(
                company_id=1,
                order_id=order.id,
                product_name="X-Burger",
                quantity=2,
                unit_price=21,
                total_price=42,
            )
        )
        session.commit()
        order_id = order.id
    finally:
        session.close()

    response = client.patch(
        f"/api/v1/operations/orders/{order_id}/status",
        headers=headers,
        json={"status": "confirmed"},
    )

    assert response.status_code == 200
    targets = sorted(job["printer_target"] for job in response.json()["print_jobs"])
    assert targets == ["cashier", "kitchen"]


def test_confirmed_delivery_order_generates_courier_ticket(client) -> None:
    headers = _auth_header(client)
    session = get_session_factory()()
    try:
        order = Order(
            company_id=1,
            code="PED-200",
            fulfillment_type="delivery",
            customer_name="Cliente Entrega",
            customer_phone="5511888888888",
            delivery_address="Rua Central, 123",
            neighborhood="Centro",
            payment_method="dinheiro",
            total_amount=58,
            subtotal=50,
            delivery_fee=8,
        )
        session.add(order)
        session.flush()
        session.add(
            OrderItem(
                company_id=1,
                order_id=order.id,
                product_name="Marmita Executiva",
                quantity=1,
                unit_price=50,
                total_price=50,
                notes="Sem cebola",
            )
        )
        session.commit()
        order_id = order.id
    finally:
        session.close()

    response = client.patch(
        f"/api/v1/operations/orders/{order_id}/status",
        headers=headers,
        json={"status": "confirmed"},
    )

    assert response.status_code == 200
    payload = response.json()
    targets = sorted(job["printer_target"] for job in payload["print_jobs"])
    assert targets == ["cashier", "courier", "kitchen"]
    courier_job = next(job for job in payload["print_jobs"] if job["printer_target"] == "courier")
    assert "Rua Central, 123" in (courier_job["payload_text"] or "")


def test_delivery_order_requires_address_before_confirmation(client) -> None:
    headers = _auth_header(client)
    session = get_session_factory()()
    try:
        order = Order(
            company_id=1,
            code="PED-300",
            fulfillment_type="delivery",
            customer_name="Cliente Sem Endereco",
            customer_phone="5511777777777",
            payment_method="pix",
            total_amount=25,
            subtotal=25,
            status="pending_confirmation",
        )
        session.add(order)
        session.flush()
        session.add(
            OrderItem(
                company_id=1,
                order_id=order.id,
                product_name="X-Salada",
                quantity=1,
                unit_price=25,
                total_price=25,
            )
        )
        session.commit()
        order_id = order.id
    finally:
        session.close()

    response = client.patch(
        f"/api/v1/operations/orders/{order_id}/status",
        headers=headers,
        json={"status": "confirmed"},
    )

    assert response.status_code == 404
    assert "endereco" in response.json()["detail"].lower()


def test_cancelled_order_cannot_be_reconfirmed(client) -> None:
    headers = _auth_header(client)
    session = get_session_factory()()
    try:
        order = Order(
            company_id=1,
            code="PED-400",
            fulfillment_type="pickup",
            customer_name="Cliente Cancelado",
            customer_phone="5511666666666",
            payment_method="pix",
            total_amount=18,
            subtotal=18,
            status="cancelled",
        )
        session.add(order)
        session.flush()
        session.add(
            OrderItem(
                company_id=1,
                order_id=order.id,
                product_name="Coca Lata",
                quantity=1,
                unit_price=18,
                total_price=18,
            )
        )
        session.commit()
        order_id = order.id
    finally:
        session.close()

    response = client.patch(
        f"/api/v1/operations/orders/{order_id}/status",
        headers=headers,
        json={"status": "confirmed"},
    )

    assert response.status_code == 404
    assert "transicao" in response.json()["detail"].lower()
