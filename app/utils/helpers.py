from __future__ import annotations

import json
import re
import unicodedata
from typing import Any

from app.schemas.conversation import ParsedIncomingMessage


def clean_text(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", value).replace("\x00", "").strip()


def truncate_text(value: str, max_length: int) -> str:
    if len(value) <= max_length:
        return value
    return f"{value[: max_length - 3].rstrip()}..."


def normalize_phone_number(value: str | None) -> str | None:
    if not value:
        return None
    digits = re.sub(r"\D", "", value)
    return digits or None


def deep_get(data: Any, path: list[str]) -> Any:
    current = data
    for key in path:
        if isinstance(current, dict) and key in current:
            current = current[key]
        elif isinstance(current, list) and key.isdigit():
            index = int(key)
            if 0 <= index < len(current):
                current = current[index]
            else:
                return None
        else:
            return None
    return current


def find_first_string(data: Any, paths: list[list[str]]) -> str | None:
    for path in paths:
        value = deep_get(data, path)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return None


def find_first_bool(data: Any, paths: list[list[str]]) -> bool:
    for path in paths:
        value = deep_get(data, path)
        if isinstance(value, bool):
            return value
    return False


def find_first_dict(data: Any, paths: list[list[str]]) -> dict[str, Any] | None:
    for path in paths:
        value = deep_get(data, path)
        if isinstance(value, dict):
            return value
    return None


def extract_instance_name(payload: dict[str, Any]) -> str | None:
    return find_first_string(payload, [["instance"], ["instanceName"], ["data", "instance"], ["sender"]])


def extract_message_id(payload: dict[str, Any]) -> str | None:
    return find_first_string(
        payload,
        [
            ["data", "key", "id"],
            ["data", "0", "key", "id"],
            ["data", "messages", "0", "key", "id"],
            ["messageId"],
            ["id"],
        ],
    )


def extract_sender_name(payload: dict[str, Any]) -> str | None:
    return find_first_string(
        payload,
        [
            ["data", "pushName"],
            ["data", "0", "pushName"],
            ["data", "senderName"],
            ["pushName"],
        ],
    )


def extract_remote_jid(payload: dict[str, Any]) -> str | None:
    return find_first_string(
        payload,
        [
            ["data", "key", "remoteJid"],
            ["data", "0", "key", "remoteJid"],
            ["data", "messages", "0", "key", "remoteJid"],
            ["data", "sender"],
            ["data", "from"],
            ["from"],
        ],
    )


def extract_message_type(payload: dict[str, Any]) -> str | None:
    message_node = find_first_dict(
        payload,
        [
            ["data", "message"],
            ["data", "0", "message"],
            ["data", "messages", "0", "message"],
        ],
    )
    if not message_node:
        return None
    for key, value in message_node.items():
        if value is not None:
            return key
    return None


def extract_interactive_text(payload: dict[str, Any]) -> str | None:
    params_json = find_first_string(
        payload,
        [
            ["data", "message", "interactiveResponseMessage", "nativeFlowResponseMessage", "paramsJson"],
            ["data", "0", "message", "interactiveResponseMessage", "nativeFlowResponseMessage", "paramsJson"],
            ["data", "messages", "0", "message", "interactiveResponseMessage", "nativeFlowResponseMessage", "paramsJson"],
        ],
    )
    if not params_json:
        return None

    try:
        parsed = json.loads(params_json)
    except json.JSONDecodeError:
        return clean_text(params_json)

    return clean_text(
        find_first_string(
            parsed,
            [
                ["title"],
                ["description"],
                ["id"],
                ["rowId"],
                ["selectedRowId"],
                ["selectedDisplayText"],
            ],
        )
    )


def extract_text(payload: dict[str, Any]) -> str:
    text = find_first_string(
        payload,
        [
            ["data", "message", "conversation"],
            ["data", "0", "message", "conversation"],
            ["data", "message", "extendedTextMessage", "text"],
            ["data", "0", "message", "extendedTextMessage", "text"],
            ["data", "message", "imageMessage", "caption"],
            ["data", "0", "message", "imageMessage", "caption"],
            ["data", "message", "videoMessage", "caption"],
            ["data", "0", "message", "videoMessage", "caption"],
            ["data", "message", "documentMessage", "caption"],
            ["data", "0", "message", "documentMessage", "caption"],
            ["data", "message", "buttonsResponseMessage", "selectedDisplayText"],
            ["data", "0", "message", "buttonsResponseMessage", "selectedDisplayText"],
            ["data", "message", "listResponseMessage", "title"],
            ["data", "0", "message", "listResponseMessage", "title"],
            ["data", "message", "listResponseMessage", "singleSelectReply", "selectedRowId"],
            ["data", "0", "message", "listResponseMessage", "singleSelectReply", "selectedRowId"],
            ["data", "message", "templateButtonReplyMessage", "selectedDisplayText"],
            ["data", "0", "message", "templateButtonReplyMessage", "selectedDisplayText"],
            ["data", "messages", "0", "message", "conversation"],
            ["data", "messages", "0", "message", "extendedTextMessage", "text"],
            ["data", "messages", "0", "message", "imageMessage", "caption"],
            ["data", "messages", "0", "message", "videoMessage", "caption"],
            ["data", "messages", "0", "message", "documentMessage", "caption"],
            ["data", "messages", "0", "message", "buttonsResponseMessage", "selectedDisplayText"],
            ["data", "messages", "0", "message", "listResponseMessage", "title"],
            ["data", "messages", "0", "message", "listResponseMessage", "singleSelectReply", "selectedRowId"],
            ["data", "messages", "0", "message", "templateButtonReplyMessage", "selectedDisplayText"],
            ["data", "body"],
            ["data", "text"],
            ["text"],
        ],
    )
    if not text:
        text = extract_interactive_text(payload)
    return clean_text(text)


def extract_phone_number(payload: dict[str, Any]) -> str | None:
    raw = extract_remote_jid(payload)
    if raw:
        raw = raw.split("@", 1)[0]
    return normalize_phone_number(raw)


def detect_from_me(payload: dict[str, Any]) -> bool:
    return find_first_bool(
        payload,
        [
            ["data", "key", "fromMe"],
            ["data", "0", "key", "fromMe"],
            ["data", "messages", "0", "key", "fromMe"],
            ["fromMe"],
        ],
    )


def is_group_jid(remote_jid: str | None) -> bool:
    return bool(remote_jid and remote_jid.endswith("@g.us"))


def is_status_jid(remote_jid: str | None) -> bool:
    if not remote_jid:
        return False
    return remote_jid == "status@broadcast" or remote_jid.endswith("@broadcast")


def is_supported_evolution_event(event_name: str | None) -> bool:
    if not event_name:
        return True
    normalized = clean_text(event_name).lower()
    return normalized in {"messages.upsert", "message.upsert", "messages_upsert"}


def parse_evolution_message(payload: dict[str, Any]) -> ParsedIncomingMessage:
    remote_jid = extract_remote_jid(payload)
    return ParsedIncomingMessage(
        event=find_first_string(payload, [["event"]]),
        instance_name=extract_instance_name(payload),
        provider_message_id=extract_message_id(payload),
        remote_jid=remote_jid,
        phone_number=extract_phone_number(payload) or "",
        sender_name=extract_sender_name(payload),
        text=extract_text(payload),
        message_type=extract_message_type(payload),
        from_me=detect_from_me(payload),
        is_group=is_group_jid(remote_jid),
        is_status=is_status_jid(remote_jid),
        raw_payload=payload,
    )


def build_slug(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-")
    return slug or "empresa"


def build_delivery_system_prompt(company_name: str, tone: str | None = None) -> str:
    normalized_tone = clean_text(tone) or "profissional, educado e objetivo"
    return clean_text(
        f"""
        Voce e o atendente virtual da {company_name}.
        Seu papel e vender, tirar duvidas e conduzir pedidos de delivery ou retirada com agilidade.
        Atue para lanchonetes, hamburguerias, marmitarias, delivery de bebidas e retirada no local.
        Sempre responda em portugues do Brasil com tom {normalized_tone}.

        Regras de atendimento:
        - Seja claro, rapido, comercial e natural. Nunca soe robotico.
        - Use somente informacoes presentes no contexto operacional e na base de conhecimento.
        - Nunca invente produto, preco, promocao, taxa, horario, bairro atendido, forma de pagamento ou prazo.
        - Quando faltar dado, admita isso com clareza e faca uma pergunta objetiva para destravar a conversa.
        - Prefira respostas curtas, em um unico bloco, com no maximo 4 frases curtas ou uma lista curta quando ajudar.
        - Nao despeje o cardapio inteiro sem necessidade. Primeiro entenda a intencao do cliente.

        Objetivos prioritarios:
        - identificar se o cliente quer ver opcoes, montar pedido, acompanhar atendimento ou tirar duvidas
        - sugerir itens relevantes do cardapio e adicionais compativeis
        - conduzir o pedido passo a passo ate ficar pronto para confirmacao
        - confirmar se e entrega ou retirada
        - quando for entrega, pedir bairro ou endereco somente no momento certo
        - esclarecer pagamento, taxa e tempo estimado usando os dados disponiveis

        Fluxo comercial:
        - Se o cliente mandar algo generico como "oi", "boa noite" ou "cardapio", responda com acolhimento e leve a conversa para venda.
        - Se o cliente pedir sugestao, indique opcoes concretas do catalogo com preco quando houver.
        - Se o cliente quiser pedir, conduza item por item: produto, variacao, adicionais, quantidade, entrega ou retirada, pagamento e observacoes.
        - Ao final de uma montagem de pedido, recapitule de forma objetiva os itens e o proximo passo.
        - Se o horario estiver fechado, informe isso e use a mensagem de fora do horario quando houver.

        Estilo de resposta:
        - Use linguagem de atendimento comercial de delivery.
        - Valorize promocao, combos, adicionais e itens em destaque quando forem relevantes.
        - Faca no maximo uma pergunta principal por resposta, salvo quando estiver confirmando fechamento do pedido.
        """
    )
