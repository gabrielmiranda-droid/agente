"use client";

import { apiRequest } from "@/lib/api/client";
import { withCompanyScope } from "@/lib/api/company-scope";
import type { ClientPanelData, DevPanelData, FinanceSummary, InventoryItem, OperationalOrder, OperationalOrderStatus } from "@/types/operations";

export function getClientPanel(companyId?: number) {
  return apiRequest<ClientPanelData>(withCompanyScope("/operations/client-panel", companyId));
}

export function getDevPanel() {
  return apiRequest<DevPanelData>("/operations/dev-panel");
}

export function getOperationalOrders(companyId?: number) {
  return apiRequest<OperationalOrder[]>(withCompanyScope("/operations/orders", companyId));
}

export function updateOperationalOrderStatus(orderId: number, status: OperationalOrderStatus, companyId?: number) {
  return apiRequest<OperationalOrder>(withCompanyScope(`/operations/orders/${orderId}/status`, companyId), {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export function getInventory(companyId?: number) {
  return apiRequest<InventoryItem[]>(withCompanyScope("/operations/inventory", companyId));
}

export function getFinanceSummary(companyId?: number) {
  return apiRequest<FinanceSummary>(withCompanyScope("/operations/finance", companyId));
}
