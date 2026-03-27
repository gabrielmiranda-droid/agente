"use client";

import { useSearchParams } from "next/navigation";

export function useCompanyScope() {
  const searchParams = useSearchParams();
  const rawValue = searchParams.get("companyId");
  const companyId = rawValue ? Number(rawValue) : undefined;

  return Number.isFinite(companyId) ? companyId : undefined;
}
