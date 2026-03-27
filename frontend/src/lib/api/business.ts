"use client";

import { apiRequest } from "@/lib/api/client";
import type {
  BusinessHour,
  BusinessProfile,
  Product,
  ProductAddon,
  ProductCategory,
  Promotion
} from "@/types/business";

function withCompanyScope(path: string, companyId?: number) {
  if (!companyId) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}company_id=${companyId}`;
}

export function getBusinessProfile(companyId?: number) {
  return apiRequest<BusinessProfile>(withCompanyScope("/business-profile", companyId));
}

export function updateBusinessProfile(payload: Record<string, unknown>, companyId?: number) {
  return apiRequest<BusinessProfile>(withCompanyScope("/business-profile", companyId), {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function getCategories(companyId?: number) {
  return apiRequest<ProductCategory[]>(withCompanyScope("/catalog/categories", companyId));
}

export function createCategory(payload: Record<string, unknown>, companyId?: number) {
  return apiRequest<ProductCategory>(withCompanyScope("/catalog/categories", companyId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateCategory(categoryId: number, payload: Record<string, unknown>, companyId?: number) {
  return apiRequest<ProductCategory>(withCompanyScope(`/catalog/categories/${categoryId}`, companyId), {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function getProducts(companyId?: number) {
  return apiRequest<Product[]>(withCompanyScope("/catalog/products", companyId));
}

export function createProduct(payload: Record<string, unknown>, companyId?: number) {
  return apiRequest<Product>(withCompanyScope("/catalog/products", companyId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateProduct(productId: number, payload: Record<string, unknown>, companyId?: number) {
  return apiRequest<Product>(withCompanyScope(`/catalog/products/${productId}`, companyId), {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function getAddons(companyId?: number) {
  return apiRequest<ProductAddon[]>(withCompanyScope("/catalog/addons", companyId));
}

export function createAddon(payload: Record<string, unknown>, companyId?: number) {
  return apiRequest<ProductAddon>(withCompanyScope("/catalog/addons", companyId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateAddon(addonId: number, payload: Record<string, unknown>, companyId?: number) {
  return apiRequest<ProductAddon>(withCompanyScope(`/catalog/addons/${addonId}`, companyId), {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function getBusinessHours(companyId?: number) {
  return apiRequest<BusinessHour[]>(withCompanyScope("/business-hours", companyId));
}

export function createBusinessHour(payload: Record<string, unknown>, companyId?: number) {
  return apiRequest<BusinessHour>(withCompanyScope("/business-hours", companyId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateBusinessHour(hourId: number, payload: Record<string, unknown>, companyId?: number) {
  return apiRequest<BusinessHour>(withCompanyScope(`/business-hours/${hourId}`, companyId), {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function getPromotions(companyId?: number) {
  return apiRequest<Promotion[]>(withCompanyScope("/promotions", companyId));
}

export function createPromotion(payload: Record<string, unknown>, companyId?: number) {
  return apiRequest<Promotion>(withCompanyScope("/promotions", companyId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updatePromotion(promotionId: number, payload: Record<string, unknown>, companyId?: number) {
  return apiRequest<Promotion>(withCompanyScope(`/promotions/${promotionId}`, companyId), {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}
