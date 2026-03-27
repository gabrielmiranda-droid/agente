from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.business import BusinessHour, BusinessProfile, Product, ProductAddon, ProductCategory, Promotion


class BusinessRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_profile(self, company_id: int) -> BusinessProfile | None:
        return self.db.execute(select(BusinessProfile).where(BusinessProfile.company_id == company_id)).scalar_one_or_none()

    def list_categories(self, company_id: int) -> list[ProductCategory]:
        return list(
            self.db.execute(
                select(ProductCategory).where(ProductCategory.company_id == company_id).order_by(ProductCategory.name.asc())
            ).scalars()
        )

    def get_category(self, company_id: int, category_id: int) -> ProductCategory | None:
        return self.db.execute(
            select(ProductCategory).where(
                ProductCategory.company_id == company_id,
                ProductCategory.id == category_id,
            )
        ).scalar_one_or_none()

    def list_products(self, company_id: int) -> list[Product]:
        return list(
            self.db.execute(
                select(Product)
                .where(Product.company_id == company_id)
                .order_by(Product.display_order.asc(), Product.name.asc())
            ).scalars()
        )

    def get_product(self, company_id: int, product_id: int) -> Product | None:
        return self.db.execute(
            select(Product).where(Product.company_id == company_id, Product.id == product_id)
        ).scalar_one_or_none()

    def list_addons(self, company_id: int) -> list[ProductAddon]:
        return list(
            self.db.execute(
                select(ProductAddon)
                .where(ProductAddon.company_id == company_id)
                .order_by(ProductAddon.product_id.asc(), ProductAddon.name.asc())
            ).scalars()
        )

    def get_addon(self, company_id: int, addon_id: int) -> ProductAddon | None:
        return self.db.execute(
            select(ProductAddon).where(ProductAddon.company_id == company_id, ProductAddon.id == addon_id)
        ).scalar_one_or_none()

    def list_business_hours(self, company_id: int) -> list[BusinessHour]:
        return list(
            self.db.execute(
                select(BusinessHour)
                .where(BusinessHour.company_id == company_id)
                .order_by(BusinessHour.day_of_week.asc())
            ).scalars()
        )

    def get_business_hour(self, company_id: int, hour_id: int) -> BusinessHour | None:
        return self.db.execute(
            select(BusinessHour).where(BusinessHour.company_id == company_id, BusinessHour.id == hour_id)
        ).scalar_one_or_none()

    def get_business_hour_by_day(self, company_id: int, day_of_week: int) -> BusinessHour | None:
        return self.db.execute(
            select(BusinessHour).where(BusinessHour.company_id == company_id, BusinessHour.day_of_week == day_of_week)
        ).scalar_one_or_none()

    def list_promotions(self, company_id: int) -> list[Promotion]:
        return list(
            self.db.execute(
                select(Promotion)
                .where(Promotion.company_id == company_id)
                .order_by(Promotion.active.desc(), Promotion.start_date.desc(), Promotion.title.asc())
            ).scalars()
        )

    def get_promotion(self, company_id: int, promotion_id: int) -> Promotion | None:
        return self.db.execute(
            select(Promotion).where(Promotion.company_id == company_id, Promotion.id == promotion_id)
        ).scalar_one_or_none()
