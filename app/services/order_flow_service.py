from __future__ import annotations

import re
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
                Order.status.in_(["new", "pending_confirmation", "confirmed", "in_preparation", "out_for_delivery", "ready_for_pickup"]),
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

    def should_offer_confirmation(self, text: str) -> bool:
        normalized = text.lower()
        purchase_terms = [
            "quero",
            "pedido",
            "pedir",
            "me ve",
            "manda",
            "traz",
            "separa",
            "adiciona",
            "adicionar",
            "combo",
            "marmita",
            "lanche",
            "hamburguer",
            "burger",
            "pizza",
            "coca",
            "guarana",
            "suco",
            "cerveja",
            "refrigerante",
        ]
        return any(term in normalized for term in purchase_terms)

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
        if not matched_items:
            return None

        order = self.get_latest_active_order(company_id=company_id, conversation_id=conversation.id)
        if order and order.status not in {"new", "pending_confirmation"}:
            order = None

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
            order.fulfillment_type = self._detect_fulfillment_type(text, fallback=order.fulfillment_type)
            order.payment_method = self._detect_payment_method(text, fallback=order.payment_method)
            order.delivery_address = self._extract_address(text) or order.delivery_address
            order.neighborhood = self._extract_neighborhood(text) or order.neighborhood
            order.notes = self._merge_notes(order.notes, self._extract_notes(text))
            order.items.clear()
            self.db.flush()

        subtotal = 0.0
        for matched in matched_items:
            line_total = matched["quantity"] * matched["unit_price"]
            subtotal += line_total
            self.db.add(
                OrderItem(
                    company_id=company_id,
                    order_id=order.id,
                    product_id=matched["product_id"],
                    product_name=matched["product_name"],
                    quantity=matched["quantity"],
                    unit_price=matched["unit_price"],
                    total_price=line_total,
                    addons_json=[],
                    notes=None,
                )
            )

        order.subtotal = subtotal
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

    def build_post_confirmation_message(self, order: Order) -> str:
        next_step = "Vou seguir com a entrega." if order.fulfillment_type == "delivery" else "Vou deixar separado para retirada."
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
        matches: list[dict] = []
        for product in products:
            product_name = self._normalize(product.name)
            if product_name not in normalized:
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
        lower = text.lower()
        note_markers = ["sem ", "tirar ", "obs", "observacao", "observação"]
        if any(marker in lower for marker in note_markers):
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
        return re.sub(r"\s+", " ", value.lower()).strip()
