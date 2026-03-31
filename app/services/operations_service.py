from collections import Counter, defaultdict
from datetime import UTC, date, datetime, time
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import NotFoundError
from app.models.ai import AIAgent, UsageMetric
from app.models.billing import Plan, Subscription
from app.models.business import BusinessHour, BusinessProfile, Product, ProductAddon, ProductCategory, Promotion
from app.models.company import Company
from app.models.conversation import Conversation, Message
from app.models.operations import AIUsageMetric, InventoryItem, Order, OrderPrintJob
from app.models.whatsapp import WhatsAppInstance
from app.schemas.operations import ClientDashboardResponse, ClientStatItem, DevDashboardResponse, FinanceSummaryResponse


def _float(value: Decimal | float | int | None) -> float:
    if value is None:
        return 0.0
    return float(value)


class OperationsService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_orders(self, company_id: int) -> list[Order]:
        return list(
            self.db.scalars(
                select(Order)
                .where(Order.company_id == company_id)
                .options(joinedload(Order.items), joinedload(Order.print_jobs))
                .order_by(Order.created_at.desc())
            ).unique().all()
        )

    def list_inventory(self, company_id: int) -> list[InventoryItem]:
        return list(
            self.db.scalars(select(InventoryItem).where(InventoryItem.company_id == company_id).order_by(InventoryItem.name.asc())).all()
        )

    def update_order_status(self, company_id: int, order_id: int, status: str) -> Order:
        order = self.db.scalar(
            select(Order)
            .where(Order.company_id == company_id, Order.id == order_id)
            .options(joinedload(Order.items), joinedload(Order.print_jobs))
        )
        if order is None:
            raise NotFoundError("Pedido nao encontrado")

        order.status = status
        if status == "confirmed":
            has_job = any(job.trigger_status == "confirmed" for job in order.print_jobs)
            if not has_job:
                payload_lines = [
                    f"Pedido {order.code}",
                    f"Cliente: {order.customer_name or 'Nao informado'}",
                    f"Entrega: {order.fulfillment_type}",
                    "Itens:",
                ]
                for item in order.items:
                    payload_lines.append(f"- {item.quantity}x {item.product_name}")
                payload_lines.append(f"Total: R$ {order.total_amount:.2f}")
                self.db.add(
                    OrderPrintJob(
                        company_id=company_id,
                        order_id=order.id,
                        trigger_status="confirmed",
                        payload_text="\n".join(payload_lines),
                        printed=False,
                    )
                )

        self.db.commit()
        refreshed = self.db.scalar(
            select(Order)
            .where(Order.company_id == company_id, Order.id == order_id)
            .options(joinedload(Order.items), joinedload(Order.print_jobs))
        )
        assert refreshed is not None
        return refreshed

    def get_finance_summary(self, company_id: int) -> FinanceSummaryResponse:
        today = datetime.now(UTC).date()
        month_start = today.replace(day=1)
        orders = list(
            self.db.scalars(
                select(Order).where(Order.company_id == company_id, Order.created_at >= datetime.combine(month_start, time.min, UTC))
            ).all()
        )
        payment_breakdown: dict[str, float] = defaultdict(float)
        top_products: Counter[str] = Counter()
        total_sold = 0.0
        for order in orders:
            if order.status == "cancelled":
                continue
            total_sold += _float(order.total_amount)
            if order.payment_method:
                payment_breakdown[order.payment_method] += _float(order.total_amount)
            for item in order.items:
                top_products[item.product_name] += item.quantity

        active_orders = [order for order in orders if order.status != "cancelled"]
        average_ticket = total_sold / len(active_orders) if active_orders else 0.0
        return FinanceSummaryResponse(
            period_start=month_start,
            period_end=today,
            total_sold=round(total_sold, 2),
            average_ticket=round(average_ticket, 2),
            orders_count=len(active_orders),
            payment_breakdown={key: round(value, 2) for key, value in payment_breakdown.items()},
            top_products=[{"name": name, "quantity": quantity} for name, quantity in top_products.most_common(5)],
        )

    def get_client_dashboard(self, company_id: int) -> ClientDashboardResponse:
        today = datetime.now(UTC).date()
        month_start = today.replace(day=1)
        orders = self.list_orders(company_id)
        business = self.db.scalar(select(BusinessProfile).where(BusinessProfile.company_id == company_id))
        company = self.db.get(Company, company_id)
        categories_count = self.db.scalar(select(func.count(ProductCategory.id)).where(ProductCategory.company_id == company_id)) or 0
        products_count = self.db.scalar(select(func.count(Product.id)).where(Product.company_id == company_id)) or 0
        addons_count = self.db.scalar(select(func.count(ProductAddon.id)).where(ProductAddon.company_id == company_id)) or 0
        promotions_count = self.db.scalar(select(func.count(Promotion.id)).where(Promotion.company_id == company_id, Promotion.active.is_(True))) or 0
        incoming_today = self.db.scalar(
            select(func.count(Message.id)).where(
                Message.company_id == company_id,
                Message.direction == "incoming",
                func.date(Message.created_at) == today,
            )
        ) or 0
        open_conversations = self.db.scalar(
            select(func.count(Conversation.id)).where(Conversation.company_id == company_id, Conversation.status != "resolved")
        ) or 0
        active_instances = self.db.scalar(
            select(func.count(WhatsAppInstance.id)).where(WhatsAppInstance.company_id == company_id, WhatsAppInstance.active.is_(True))
        ) or 0
        today_orders = [order for order in orders if order.created_at.date() == today and order.status != "cancelled"]
        month_orders = [order for order in orders if order.created_at.date() >= month_start and order.status != "cancelled"]
        in_progress_statuses = {"confirmed", "in_preparation", "out_for_delivery", "ready_for_pickup"}
        completed_orders = [order for order in today_orders if order.status == "completed"]
        in_progress_orders = [order for order in today_orders if order.status in in_progress_statuses]
        daily_revenue = sum(_float(order.total_amount) for order in today_orders)
        monthly_revenue = sum(_float(order.total_amount) for order in month_orders)

        inventory_alerts = []
        inventory_items = self.list_inventory(company_id)
        for item in inventory_items:
            if _float(item.current_quantity) <= _float(item.low_stock_threshold):
                inventory_alerts.append(
                    {
                        "id": item.id,
                        "name": item.name,
                        "current_quantity": _float(item.current_quantity),
                        "threshold": _float(item.low_stock_threshold),
                        "available_for_sale": item.available_for_sale,
                    }
                )

        finance_summary = self.get_finance_summary(company_id).model_dump()
        hours = list(
            self.db.scalars(select(BusinessHour).where(BusinessHour.company_id == company_id).order_by(BusinessHour.day_of_week.asc())).all()
        )

        stats = [
            ClientStatItem(label="Pedidos do dia", value=len(today_orders), hint="Pedidos criados hoje"),
            ClientStatItem(label="Em andamento", value=len(in_progress_orders), hint="Fluxo operacional ativo"),
            ClientStatItem(label="Concluidos", value=len(completed_orders), hint="Pedidos finalizados hoje"),
            ClientStatItem(label="Faturamento diario", value=round(daily_revenue, 2), hint="Receita valida do dia"),
            ClientStatItem(label="Faturamento mensal", value=round(monthly_revenue, 2), hint="Receita valida do mes"),
            ClientStatItem(label="Mensagens recebidas", value=incoming_today, hint="WhatsApp recebido hoje"),
            ClientStatItem(
                label="WhatsApp",
                value="Conectado" if active_instances else "Offline",
                hint="Status das instancias ativas",
                tone="success" if active_instances else "danger",
            ),
            ClientStatItem(
                label="Bot",
                value="Ativo" if company and not company.bot_paused else "Pausado",
                hint="Automacao operacional",
                tone="success" if company and not company.bot_paused else "warning",
            ),
        ]

        ai_context_sources = [
            {"source": "Perfil do negocio", "items": 1 if business else 0, "description": "Enderecos, bairros, taxas e mensagens automativas."},
            {"source": "Catalogo", "items": products_count + addons_count, "description": "Produtos, adicionais, precos e disponibilidade."},
            {"source": "Promocoes", "items": promotions_count, "description": "Ofertas e campanhas ativas no atendimento."},
            {"source": "Horarios", "items": len(hours), "description": "Janela de funcionamento, retirada e entrega."},
            {"source": "Configuracao da empresa", "items": 1 if company else 0, "description": "Tom do agente, pausa do bot e instrucoes base."},
        ]

        return ClientDashboardResponse(
            stats=stats,
            orders=orders[:12],
            inbox_counts={"open": int(open_conversations), "all": self.db.scalar(select(func.count(Conversation.id)).where(Conversation.company_id == company_id)) or 0},
            catalog_summary={
                "categories": int(categories_count),
                "products": int(products_count),
                "addons": int(addons_count),
                "promotions": int(promotions_count),
            },
            inventory_alerts=inventory_alerts[:8],
            finance_summary=finance_summary,
            business_snapshot={
                "business_name": business.business_name if business else company.name if company else "Empresa",
                "phone": business.phone if business else None,
                "address": business.address if business else None,
                "delivery_fee": _float(business.delivery_fee) if business and business.delivery_fee is not None else 0,
                "payment_methods": business.payment_methods if business and business.payment_methods else [],
                "welcome_message": business.welcome_message if business else None,
                "out_of_hours_message": business.out_of_hours_message if business else None,
                "estimated_delivery_time": business.estimated_delivery_time if business else None,
            },
            ai_context_sources=ai_context_sources,
        )

    def get_dev_dashboard(self) -> DevDashboardResponse:
        companies = list(self.db.scalars(select(Company).order_by(Company.created_at.desc())).all())
        subscriptions = list(
            self.db.scalars(select(Subscription).options(joinedload(Subscription.plan)).order_by(Subscription.created_at.desc())).all()
        )
        instances = list(self.db.scalars(select(WhatsAppInstance).order_by(WhatsAppInstance.created_at.desc())).all())
        agents = list(self.db.scalars(select(AIAgent).order_by(AIAgent.created_at.desc())).all())
        usage_metrics = list(self.db.scalars(select(AIUsageMetric).order_by(AIUsageMetric.created_at.desc())).all())
        legacy_usage = list(self.db.scalars(select(UsageMetric).order_by(UsageMetric.created_at.desc())).all())

        plan_counter: Counter[str] = Counter()
        for subscription in subscriptions:
            plan_name = subscription.plan.name if subscription.plan else "Sem plano"
            plan_counter[plan_name] += 1

        company_breakdown = []
        for company in companies:
            company_instances = [item for item in instances if item.company_id == company.id]
            company_agents = [item for item in agents if item.company_id == company.id]
            company_usage = [item for item in usage_metrics if item.company_id == company.id]
            legacy_company_usage = [item for item in legacy_usage if item.company_id == company.id]
            token_total = sum(item.total_tokens for item in company_usage) + sum(item.metric_value for item in legacy_company_usage if item.metric_name == "tokens")
            company_breakdown.append(
                {
                    "company_id": company.id,
                    "name": company.name,
                    "status": company.status,
                    "bot_paused": company.bot_paused,
                    "connected_instances": len([item for item in company_instances if item.active]),
                    "total_instances": len(company_instances),
                    "active_agents": len([item for item in company_agents if item.active]),
                    "tokens": token_total,
                }
            )

        total_tokens = sum(item.total_tokens for item in usage_metrics) + sum(item.metric_value for item in legacy_usage if item.metric_name == "tokens")
        total_cost = sum(_float(item.estimated_cost) for item in usage_metrics) + sum(
            _float(item.estimated_cost) for item in legacy_usage
        )
        active_companies = len([company for company in companies if company.status == "active"])
        active_channels = len([instance for instance in instances if instance.active])

        stats = [
            ClientStatItem(label="Empresas ativas", value=active_companies, hint="Contas prontas para operar"),
            ClientStatItem(label="Canais ativos", value=active_channels, hint="Instancias WhatsApp conectadas"),
            ClientStatItem(label="Agentes ativos", value=len([agent for agent in agents if agent.active]), hint="Bots disponiveis"),
            ClientStatItem(label="Tokens totais", value=total_tokens, hint="Consumo acumulado registrado"),
            ClientStatItem(label="Custo estimado", value=round(total_cost, 2), hint="Uso consolidado de IA"),
            ClientStatItem(label="Falhas de webhook", value=0, hint="Pronto para observabilidade centralizada"),
        ]

        channel_summary = [
            {
                "company_id": instance.company_id,
                "instance_name": instance.instance_name,
                "phone_number": instance.phone_number,
                "active": instance.active,
                "api_base_url": instance.api_base_url,
            }
            for instance in instances[:12]
        ]

        global_logs = [
            {"title": "Observabilidade central", "level": "info", "description": "Painel preparado para consolidar erros, webhooks e filas."},
            {
                "title": "Impressao por status",
                "level": "info",
                "description": "Confirmacao de pedido gera registro tecnico de impressao sem depender do texto da IA.",
            },
            {
                "title": "Company isolation",
                "level": "success",
                "description": "Todos os modulos novos foram estruturados com company_id como chave de isolamento.",
            },
        ]

        return DevDashboardResponse(
            global_stats=stats,
            company_breakdown=company_breakdown,
            plan_breakdown=[{"plan": key, "companies": value} for key, value in plan_counter.items()],
            ai_usage={
                "total_tokens": total_tokens,
                "estimated_cost": round(total_cost, 2),
                "models": dict(Counter(item.model_name for item in usage_metrics)),
            },
            global_logs=global_logs,
            channel_summary=channel_summary,
        )
