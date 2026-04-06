from __future__ import annotations

import re
import unicodedata
from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.business import Product
from app.models.conversation import Contact, Conversation
from app.models.operations import Order, OrderItem


def _float(value: Decimal | float | int | None) -> float:
    if value is None:
        return 0.0
    return float(value)


class OrderFlowService:
    CONFIRM_ACTION = "confirm_order"
    ADJUST_ACTION = "adjust_order"
    CANCEL_ACTION = "cancel_order"

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_latest_active_order(self, *, company_id: int, conversation_id: int) -> Order | None:
        return self.db.scalar(
            select(Order)
            .where(
                Order.company_id == company_id,
                Order.conversation_id == conversation_id,
                Order.status.in_(
                    [
                        "new",
                        "pending_confirmation",
                        "confirmed",
                        "in_preparation",
                        "out_for_delivery",
                        "ready_for_pickup",
                    ]
                ),
            )
            .options(joinedload(Order.items), joinedload(Order.print_jobs))
            .order_by(Order.created_at.desc())
        )

    def get_latest_pending_order(self, *, company_id: int, conversation_id: int) -> Order | None:
        return self.db.scalar(
            select(Order)
            .where(
                Order.company_id == company_id,
                Order.conversation_id == conversation_id,
                Order.status == "pending_confirmation",
            )
            .options(joinedload(Order.items), joinedload(Order.print_jobs))
            .order_by(Order.created_at.desc())
        )

    def extract_confirmation_action(self, text: str) -> tuple[str, int] | None:
        normalized = text.strip().lower()
        match = re.match(r"^(confirm_order|adjust_order|cancel_order):(\d+)$", normalized)
        if not match:
            return None
        return match.group(1), int(match.group(2))

    def is_textual_confirmation(self, text: str) -> bool:
        normalized = self._normalize(text)
        confirmation_terms = {
            "s",
            "sim",
            "pode",
            "pode confirmar",
            "confirma",
            "confirmar",
            "confirmado",
            "fechar pedido",
            "fechar",
            "ok",
            "okk",
            "blz",
            "beleza",
            "isso",
            "isso mesmo",
        }
        return normalized in confirmation_terms

    def is_textual_cancellation(self, text: str) -> bool:
        normalized = self._normalize(text)
        cancellation_terms = {
            "cancelar",
            "cancela",
            "nao quero",
            "deixa",
            "deixa pra la",
            "deixa pra la mesmo",
        }
        return normalized in cancellation_terms

    def has_checkout_context(self, text: str) -> bool:
        normalized = self._normalize(text)
        return any(
            term in normalized
            for term in [
                "retirada",
                "retirar",
                "buscar",
                "balcao",
                "entrega",
                "entregar",
                "delivery",
                "motoboy",
                "pix",
                "cartao",
                "dinheiro",
                "rua",
                "avenida",
                "av ",
                "travessa",
                "alameda",
                "bairro",
            ]
        )

    def should_offer_confirmation(self, text: str, matched_product_count: int = 0) -> bool:
        normalized = self._normalize(text)
        purchase_terms = [
            "quero",
            "pedir",
            "me ve",
            "me de",
            "gostaria de",
            "manda",
            "traz",
            "separa",
            "adiciona",
            "adicionar",
            "fechar pedido",
            "monta um pedido",
            "fazer um pedido",
        ]
        has_explicit_intent = any(term in normalized for term in purchase_terms)
        has_quantity_hint = bool(re.search(r"\b\d+\s*x?\b", normalized))
        return has_explicit_intent or has_quantity_hint or matched_product_count >= 2

    def update_order_context_from_text(self, order: Order, text: str) -> bool:
        original = (
            order.fulfillment_type,
            order.payment_method,
            order.delivery_address,
            order.neighborhood,
            order.notes,
        )
        order.fulfillment_type = self._detect_fulfillment_type(text, fallback=order.fulfillment_type)
        order.payment_method = self._detect_payment_method(text, fallback=order.payment_method)
        order.delivery_address = self._extract_address(text) or order.delivery_address
        order.neighborhood = self._extract_neighborhood(text) or order.neighborhood
        order.notes = self._merge_notes(order.notes, self._extract_notes(text))
        self.db.flush()
        updated = (
            order.fulfillment_type,
            order.payment_method,
            order.delivery_address,
            order.neighborhood,
            order.notes,
        )
        return updated != original

    def build_or_update_draft_order(
        self,
        *,
        company_id: int,
        conversation: Conversation,
        contact: Contact,
        text: str,
    ) -> Order | None:
        products = list(
            self.db.scalars(
                select(Product)
                .where(Product.company_id == company_id, Product.active.is_(True))
                .order_by(Product.featured.desc(), Product.display_order.asc(), Product.name.asc())
            ).all()
        )
        matched_items = self._match_products(text, products)
        order = self.get_latest_active_order(company_id=company_id, conversation_id=conversation.id)
        if order and order.status not in {"new", "pending_confirmation"}:
            order = None

        if order is None and not self.should_offer_confirmation(text, len(matched_items)):
            return None

        if not matched_items and order is None:
            return None

        if order is None:
            order = Order(
                company_id=company_id,
                conversation_id=conversation.id,
                contact_id=contact.id,
                code=self._generate_order_code(company_id),
                status="pending_confirmation",
                fulfillment_type=self._detect_fulfillment_type(text),
                payment_method=self._detect_payment_method(text),
                customer_name=contact.name,
                customer_phone=contact.phone_number,
                delivery_address=self._extract_address(text),
                neighborhood=self._extract_neighborhood(text),
                notes=self._extract_notes(text),
            )
            self.db.add(order)
            self.db.flush()
        else:
            order.status = "pending_confirmation"

        self.update_order_context_from_text(order, text)
        subtotal = self._merge_items(order, matched_items, company_id)
        order.delivery_fee = order.delivery_fee or 0
        order.discount_amount = order.discount_amount or 0
        order.total_amount = subtotal + _float(order.delivery_fee) - _float(order.discount_amount)
        self.db.flush()
        self.db.refresh(order)
        return order

    def build_confirmation_message(self, order: Order) -> str:
        item_lines = ", ".join(f"{item.quantity}x {item.product_name}" for item in order.items) or "Sem itens"
        pieces = [
            f"Montei seu pedido {order.code}: {item_lines}.",
            f"Total atual: R$ {_float(order.total_amount):.2f}.",
            "Posso confirmar esse pedido agora?",
        ]
        return " ".join(pieces)

    def build_pending_context_message(self, order: Order) -> str:
        return f"{self.build_confirmation_message(order)} Se estiver tudo certo, responda SIM."

    def build_post_confirmation_message(self, order: Order) -> str:
        if order.fulfillment_type == "delivery":
            next_step = (
                "Agora me informe o endereco e bairro se ainda faltar, para eu deixar a entrega pronta."
                if not order.delivery_address
                else "Vou seguir com a entrega."
            )
        else:
            next_step = "Vou deixar separado para retirada."
        payment = order.payment_method or "pagamento a confirmar"
        return (
            f"Pedido {order.code} confirmado com sucesso. "
            f"Total: R$ {_float(order.total_amount):.2f}. "
            f"Forma de pagamento: {payment}. "
            f"{next_step}"
        )

    def build_adjustment_message(self, order: Order) -> str:
        return (
            f"Pedido {order.code} ficou pendente para ajuste. "
            "Me diga o que deseja alterar para eu montar novamente antes de confirmar."
        )

    def build_cancel_message(self, order: Order) -> str:
        return f"Pedido {order.code} cancelado por enquanto. Se quiser, posso montar um novo pedido com voce."

    def build_confirmation_list_payload(self, order: Order) -> dict:
        return {
            "title": f"Confirmar pedido {order.code}",
            "description": "Escolha uma opcao para seguir com o atendimento.",
            "button_text": "Escolher opcao",
            "footer_text": "Confirmacao de pedido",
            "sections": [
                {
                    "title": "Pedido",
                    "rows": [
                        {
                            "title": "Confirmar pedido",
                            "description": f"Confirma o pedido {order.code} e libera a impressao",
                            "row_id": f"{self.CONFIRM_ACTION}:{order.id}",
                        },
                        {
                            "title": "Ajustar pedido",
                            "description": "Alterar itens antes da confirmacao",
                            "row_id": f"{self.ADJUST_ACTION}:{order.id}",
                        },
                        {
                            "title": "Cancelar pedido",
                            "description": "Cancelar este pedido",
                            "row_id": f"{self.CANCEL_ACTION}:{order.id}",
                        },
                    ],
                }
            ],
        }

    def _match_products(self, text: str, products: list[Product]) -> list[dict]:
        normalized = self._normalize(text)
        compact_text = self._compact(text)
        matches: list[dict] = []
        for product in products:
            product_name = self._normalize(product.name)
            compact_product_name = self._compact(product.name)
            if product_name not in normalized and compact_product_name not in compact_text:
                continue
            quantity = self._extract_quantity(normalized, product_name)
            unit_price = _float(product.promotional_price if product.promotional_price is not None else product.price)
            matches.append(
                {
                    "product_id": product.id,
                    "product_name": product.name,
                    "quantity": quantity,
                    "unit_price": unit_price,
                }
            )
        return matches

    def _merge_items(self, order: Order, matched_items: list[dict], company_id: int) -> float:
        existing_by_product_id = {item.product_id: item for item in order.items if item.product_id is not None}

        for matched in matched_items:
            existing = existing_by_product_id.get(matched["product_id"])
            if existing:
                existing.quantity += matched["quantity"]
                existing.unit_price = matched["unit_price"]
                existing.total_price = existing.quantity * matched["unit_price"]
            else:
                order.items.append(
                    OrderItem(
                        company_id=company_id,
                        product_id=matched["product_id"],
                        product_name=matched["product_name"],
                        quantity=matched["quantity"],
                        unit_price=matched["unit_price"],
                        total_price=matched["quantity"] * matched["unit_price"],
                        addons_json=[],
                        notes=None,
                    )
                )
        self.db.flush()
        subtotal = sum(_float(item.total_price) for item in order.items)
        order.subtotal = subtotal
        return subtotal

    def _extract_quantity(self, normalized_text: str, normalized_product_name: str) -> int:
        patterns = [
            rf"(\d+)\s*x\s*{re.escape(normalized_product_name)}",
            rf"(\d+)\s+{re.escape(normalized_product_name)}",
        ]
        for pattern in patterns:
            match = re.search(pattern, normalized_text)
            if match:
                return max(1, int(match.group(1)))
        return 1

    def _detect_fulfillment_type(self, text: str, fallback: str | None = None) -> str:
        normalized = self._normalize(text)
        if any(term in normalized for term in ["retirada", "retirar", "buscar", "balcao"]):
            return "pickup"
        if any(term in normalized for term in ["entrega", "entregar", "delivery", "motoboy"]):
            return "delivery"
        return fallback or "delivery"

    def _detect_payment_method(self, text: str, fallback: str | None = None) -> str | None:
        normalized = self._normalize(text)
        if "pix" in normalized:
            return "pix"
        if "cartao" in normalized:
            return "cartao"
        if "dinheiro" in normalized:
            return "dinheiro"
        return fallback

    def _extract_address(self, text: str) -> str | None:
        match = re.search(r"(rua|av|avenida|travessa|alameda)\s+[^,]+(?:,\s*\d+)?", text, flags=re.IGNORECASE)
        return match.group(0).strip() if match else None

    def _extract_neighborhood(self, text: str) -> str | None:
        match = re.search(r"bairro\s+([a-zA-Z0-9\\-\\s]+)", text, flags=re.IGNORECASE)
        return match.group(1).strip() if match else None

    def _extract_notes(self, text: str) -> str | None:
        normalized = self._normalize(text)
        note_markers = ["sem ", "tirar ", "obs", "observacao"]
        if any(marker in normalized for marker in note_markers):
            return text.strip()
        return None

    @staticmethod
    def _merge_notes(current: str | None, new: str | None) -> str | None:
        if current and new and new not in current:
            return f"{current} | {new}"
        return new or current

    def _generate_order_code(self, company_id: int) -> str:
        total = self.db.scalar(select(Order.id).where(Order.company_id == company_id).order_by(Order.id.desc()).limit(1))
        next_number = (int(total) if total else 0) + 1
        return f"PED-{next_number:04d}"

    @staticmethod
    def _normalize(value: str) -> str:
        ascii_value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
        cleaned = re.sub(r"[^a-z0-9]+", " ", ascii_value.lower())
        return re.sub(r"\s+", " ", cleaned).strip()

    @classmethod
    def _compact(cls, value: str) -> str:
        return cls._normalize(value).replace(" ", "")
