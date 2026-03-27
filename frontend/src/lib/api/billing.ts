"use client";

import { apiRequest } from "@/lib/api/client";
import type { Plan, Subscription } from "@/types/billing";

export function getPlans() {
  return apiRequest<Plan[]>("/billing/plans");
}

export function getSubscription() {
  return apiRequest<Subscription | null>("/billing/subscription");
}

