"use client";

import { useQuery } from "@tanstack/react-query";

import { getMetrics } from "@/lib/api/metrics";
import { queryKeys } from "@/lib/query-keys";

export function useMetrics(companyId?: number) {
  return useQuery({ queryKey: queryKeys.metrics(companyId), queryFn: () => getMetrics(companyId) });
}
