from datetime import UTC, date, datetime, time

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ValidationError
from app.models.business import BusinessHour, BusinessProfile, Product, ProductAddon, ProductCategory, Promotion
from app.repositories.business_repository import BusinessRepository
from app.repositories.company_repository import CompanyRepository
from app.schemas.business import (
    BusinessHourCreate,
    BusinessHourUpdate,
    BusinessProfileUpdate,
    ProductAddonCreate,
    ProductAddonUpdate,
    ProductCategoryCreate,
    ProductCategoryUpdate,
    ProductCreate,
    ProductUpdate,
    PromotionCreate,
    PromotionUpdate,
)


class BusinessService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repository = BusinessRepository(db)
        self.company_repository = CompanyRepository(db)

    def get_or_create_profile(self, company_id: int) -> BusinessProfile:
        profile = self.repository.get_profile(company_id)
        if profile:
            return profile

        company = self.company_repository.get_by_id(company_id)
        if not company:
            raise NotFoundError("Empresa não encontrada")

        profile = BusinessProfile(
            company_id=company_id,
            business_name=company.name,
            accepts_pickup=True,
            payment_methods=[],
            welcome_message=None,
            out_of_hours_message=company.absence_message,
        )
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def update_profile(self, company_id: int, payload: BusinessProfileUpdate) -> BusinessProfile:
        profile = self.get_or_create_profile(company_id)
        for field, value in payload.model_dump().items():
            setattr(profile, field, value)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def list_categories(self, company_id: int) -> list[ProductCategory]:
        return self.repository.list_categories(company_id)

    def create_category(self, company_id: int, payload: ProductCategoryCreate) -> ProductCategory:
        category = ProductCategory(company_id=company_id, **payload.model_dump())
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category

    def update_category(self, company_id: int, category_id: int, payload: ProductCategoryUpdate) -> ProductCategory:
        category = self.repository.get_category(company_id, category_id)
        if not category:
            raise NotFoundError("Categoria não encontrada")
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(category, field, value)
        self.db.commit()
        self.db.refresh(category)
        return category

    def list_products(self, company_id: int) -> list[Product]:
        return self.repository.list_products(company_id)

    def create_product(self, company_id: int, payload: ProductCreate) -> Product:
        if payload.category_id:
            self._ensure_category(company_id, payload.category_id)
        product = Product(company_id=company_id, **payload.model_dump())
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product

    def update_product(self, company_id: int, product_id: int, payload: ProductUpdate) -> Product:
        product = self.repository.get_product(company_id, product_id)
        if not product:
            raise NotFoundError("Produto não encontrado")
        updates = payload.model_dump(exclude_unset=True)
        if updates.get("category_id"):
            self._ensure_category(company_id, updates["category_id"])
        for field, value in updates.items():
            setattr(product, field, value)
        self.db.commit()
        self.db.refresh(product)
        return product

    def list_addons(self, company_id: int) -> list[ProductAddon]:
        return self.repository.list_addons(company_id)

    def create_addon(self, company_id: int, payload: ProductAddonCreate) -> ProductAddon:
        self._ensure_product(company_id, payload.product_id)
        addon = ProductAddon(company_id=company_id, **payload.model_dump())
        self.db.add(addon)
        self.db.commit()
        self.db.refresh(addon)
        return addon

    def update_addon(self, company_id: int, addon_id: int, payload: ProductAddonUpdate) -> ProductAddon:
        addon = self.repository.get_addon(company_id, addon_id)
        if not addon:
            raise NotFoundError("Adicional não encontrado")
        updates = payload.model_dump(exclude_unset=True)
        if updates.get("product_id"):
            self._ensure_product(company_id, updates["product_id"])
        for field, value in updates.items():
            setattr(addon, field, value)
        self.db.commit()
        self.db.refresh(addon)
        return addon

    def list_business_hours(self, company_id: int) -> list[BusinessHour]:
        return self.repository.list_business_hours(company_id)

    def create_or_update_business_hour(self, company_id: int, payload: BusinessHourCreate) -> BusinessHour:
        existing = self.repository.get_business_hour_by_day(company_id, payload.day_of_week)
        if existing:
            existing.open_time = payload.open_time
            existing.close_time = payload.close_time
            existing.active = payload.active
            self.db.commit()
            self.db.refresh(existing)
            return existing
        hour = BusinessHour(company_id=company_id, **payload.model_dump())
        self.db.add(hour)
        self.db.commit()
        self.db.refresh(hour)
        return hour

    def update_business_hour(self, company_id: int, hour_id: int, payload: BusinessHourUpdate) -> BusinessHour:
        hour = self.repository.get_business_hour(company_id, hour_id)
        if not hour:
            raise NotFoundError("Horário não encontrado")
        updates = payload.model_dump(exclude_unset=True)
        if "day_of_week" in updates and updates["day_of_week"] != hour.day_of_week:
            conflict = self.repository.get_business_hour_by_day(company_id, updates["day_of_week"])
            if conflict:
                raise ValidationError("Já existe horário cadastrado para este dia")
        for field, value in updates.items():
            setattr(hour, field, value)
        self.db.commit()
        self.db.refresh(hour)
        return hour

    def list_promotions(self, company_id: int) -> list[Promotion]:
        return self.repository.list_promotions(company_id)

    def create_promotion(self, company_id: int, payload: PromotionCreate) -> Promotion:
        self._validate_promotion_dates(payload.start_date, payload.end_date)
        promotion = Promotion(company_id=company_id, **payload.model_dump())
        self.db.add(promotion)
        self.db.commit()
        self.db.refresh(promotion)
        return promotion

    def update_promotion(self, company_id: int, promotion_id: int, payload: PromotionUpdate) -> Promotion:
        promotion = self.repository.get_promotion(company_id, promotion_id)
        if not promotion:
            raise NotFoundError("Promoção não encontrada")
        updates = payload.model_dump(exclude_unset=True)
        self._validate_promotion_dates(
            updates.get("start_date", promotion.start_date),
            updates.get("end_date", promotion.end_date),
        )
        for field, value in updates.items():
            setattr(promotion, field, value)
        self.db.commit()
        self.db.refresh(promotion)
        return promotion

    def build_ai_operational_context(self, company_id: int) -> list[str]:
        profile = self.repository.get_profile(company_id)
        categories = [item for item in self.repository.list_categories(company_id) if item.active]
        products = [item for item in self.repository.list_products(company_id) if item.active]
        addons = [item for item in self.repository.list_addons(company_id) if item.active]
        business_hours = [item for item in self.repository.list_business_hours(company_id) if item.active]
        promotions = [item for item in self.repository.list_promotions(company_id) if item.active]

        snippets: list[str] = []
        if profile:
            payment_methods = ", ".join(profile.payment_methods or []) or "não informado"
            snippets.append(
                "Negócio: "
                f"{profile.business_name}. Telefone: {profile.phone or 'não informado'}. "
                f"Endereço: {profile.address or 'não informado'} - {profile.neighborhood or 'bairro não informado'}, "
                f"{profile.city or 'cidade não informada'}. "
                f"Taxa de entrega: {profile.delivery_fee if profile.delivery_fee is not None else 'não informada'}. "
                f"Tempo estimado: {profile.estimated_delivery_time or 'não informado'}. "
                f"Retirada no local: {'sim' if profile.accepts_pickup else 'não'}. "
                f"Pagamentos: {payment_methods}."
            )
            if profile.welcome_message:
                snippets.append(f"Mensagem de boas-vindas da empresa: {profile.welcome_message}")
            if profile.out_of_hours_message:
                snippets.append(f"Mensagem fora do horário: {profile.out_of_hours_message}")

        if categories:
            snippets.append("Categorias ativas: " + ", ".join(category.name for category in categories[:20]))

        if products:
            product_lines = []
            for product in products[:30]:
                category_name = product.category.name if product.category else "Sem categoria"
                price = float(product.price)
                promo = float(product.promotional_price) if product.promotional_price is not None else None
                price_text = f"R$ {promo:.2f} promocional" if promo is not None else f"R$ {price:.2f}"
                product_lines.append(f"{product.name} ({category_name}) - {price_text}. {product.description or ''}".strip())
            snippets.append("Produtos ativos: " + " | ".join(product_lines))

        if addons:
            addon_lines = [
                f"{addon.name} para {addon.product.name} - R$ {float(addon.price):.2f}"
                for addon in addons[:30]
                if addon.product
            ]
            if addon_lines:
                snippets.append("Adicionais ativos: " + " | ".join(addon_lines))

        if business_hours:
            day_labels = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"]
            snippets.append(
                "Horários de atendimento: "
                + " | ".join(
                    f"{day_labels[item.day_of_week]} {item.open_time.strftime('%H:%M')} às {item.close_time.strftime('%H:%M')}"
                    for item in business_hours
                )
            )

        if promotions:
            snippets.append(
                "Promoções ativas: "
                + " | ".join(
                    f"{item.title}: {item.description or 'sem descrição'}"
                    for item in promotions[:10]
                    if not item.end_date or item.end_date >= date.today()
                )
            )

        return snippets

    def is_open_now(self, company_id: int, reference: datetime | None = None) -> bool:
        active_hours = [item for item in self.repository.list_business_hours(company_id) if item.active]
        if not active_hours:
            return True

        current = reference or datetime.now(UTC).astimezone()
        day_of_week = (current.weekday() + 1) % 7
        current_time = current.time().replace(tzinfo=None)

        for item in active_hours:
            if item.day_of_week != day_of_week:
                continue
            if self._time_in_range(item.open_time, item.close_time, current_time):
                return True
        return False

    def get_out_of_hours_message(self, company_id: int) -> str | None:
        profile = self.repository.get_profile(company_id)
        if profile and profile.out_of_hours_message:
            return profile.out_of_hours_message

        company = self.company_repository.get_by_id(company_id)
        return company.absence_message if company else None

    def _ensure_category(self, company_id: int, category_id: int) -> ProductCategory:
        category = self.repository.get_category(company_id, category_id)
        if not category:
            raise NotFoundError("Categoria não encontrada")
        return category

    def _ensure_product(self, company_id: int, product_id: int) -> Product:
        product = self.repository.get_product(company_id, product_id)
        if not product:
            raise NotFoundError("Produto não encontrado")
        return product

    def _validate_promotion_dates(self, start_date: date | None, end_date: date | None) -> None:
        if start_date and end_date and end_date < start_date:
            raise ValidationError("A data final da promoção não pode ser menor que a inicial")

    @staticmethod
    def _time_in_range(start: time, end: time, current: time) -> bool:
        if start <= end:
            return start <= current <= end
        return current >= start or current <= end
