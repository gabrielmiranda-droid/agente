"use client";

import { apiRequest } from "@/lib/api/client";
import { withCompanyScope } from "@/lib/api/company-scope";
import type { UsageMetric } from "@/types/ai";

export function getMetrics(companyId?: number) {
  return apiRequest<UsageMetric[]>(withCompanyScope("/metrics", companyId));
}
