"use client";

import { apiRequest } from "@/lib/api/client";
import { withCompanyScope } from "@/lib/api/company-scope";
import type { Company, CompanyCreatePayload, CompanyUpdatePayload } from "@/types/company";

export function getCompany(companyId?: number) {
  if (companyId) {
    return apiRequest<Company>(`/companies/${companyId}`);
  }
  return apiRequest<Company>("/companies/me");
}

export function getCompanies() {
  return apiRequest<Company[]>("/companies");
}

export function createCompany(payload: CompanyCreatePayload) {
  return apiRequest<Company>("/companies", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateCompany(payload: CompanyUpdatePayload) {
  return apiRequest<Company>("/companies/me", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function updateCompanyById(companyId: number, payload: CompanyUpdatePayload) {
  return apiRequest<Company>(withCompanyScope(`/companies/${companyId}`, companyId), {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteCompany(companyId: number) {
  return apiRequest<void>(`/companies/${companyId}`, {
    method: "DELETE"
  });
}
