from app.utils.helpers import build_slug, parse_evolution_message


def test_build_slug() -> None:
    assert build_slug("Clinica Exemplo 24h") == "clinica-exemplo-24h"
    assert build_slug("Hamburgueria Sao Joao") == "hamburgueria-sao-joao"


def test_parse_evolution_message_extracts_fields() -> None:
    payload = {
        "event": "messages.upsert",
        "instance": "tenant-main",
        "data": {
            "key": {
                "remoteJid": "5511999999999@s.whatsapp.net",
                "fromMe": False,
                "id": "MSG-123",
            },
            "pushName": "Cliente",
            "message": {"conversation": "Ola, preciso de ajuda"},
        },
    }

    parsed = parse_evolution_message(payload)
    assert parsed.instance_name == "tenant-main"
    assert parsed.phone_number == "5511999999999"
    assert parsed.provider_message_id == "MSG-123"
    assert parsed.text == "Ola, preciso de ajuda"


def test_parse_evolution_message_supports_button_payloads() -> None:
    payload = {
        "event": "messages.upsert",
        "instance": "tenant-main",
        "data": {
            "messages": [
                {
                    "key": {
                        "remoteJid": "5511988887777@s.whatsapp.net",
                        "fromMe": False,
                        "id": "MSG-456",
                    },
                    "pushName": "Cliente",
                    "message": {
                        "buttonsResponseMessage": {
                            "selectedDisplayText": "Quero ver o cardapio"
                        }
                    },
                }
            ]
        },
    }

    parsed = parse_evolution_message(payload)
    assert parsed.phone_number == "5511988887777"
    assert parsed.text == "Quero ver o cardapio"
    assert parsed.message_type == "buttonsResponseMessage"


def test_parse_evolution_message_marks_group_messages() -> None:
    payload = {
        "event": "messages.upsert",
        "instance": "tenant-main",
        "data": {
            "key": {
                "remoteJid": "120363000000000000@g.us",
                "fromMe": False,
                "id": "MSG-789",
            },
            "pushName": "Grupo Teste",
            "message": {"imageMessage": {"caption": "foto do pedido"}},
        },
    }

    parsed = parse_evolution_message(payload)
    assert parsed.is_group is True
    assert parsed.text == "foto do pedido"
