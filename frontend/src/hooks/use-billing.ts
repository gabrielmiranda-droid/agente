"use client";

import { useQuery } from "@tanstack/react-query";

import { getPlans, getSubscription } from "@/lib/api/billing";
import { queryKeys } from "@/lib/query-keys";

export function usePlans() {
  return useQuery({ queryKey: queryKeys.plans, queryFn: getPlans });
}

export function useSubscription() {
  return useQuery({ queryKey: queryKeys.subscription, queryFn: getSubscription });
}
