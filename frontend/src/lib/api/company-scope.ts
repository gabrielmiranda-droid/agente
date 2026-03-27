"use client";

export function withCompanyScope(path: string, companyId?: number) {
  if (!companyId) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}company_id=${companyId}`;
}
