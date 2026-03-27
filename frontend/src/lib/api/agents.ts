"use client";

import { apiRequest } from "@/lib/api/client";
import { withCompanyScope } from "@/lib/api/company-scope";
import type { Agent } from "@/types/ai";

export function getAgents(companyId?: number) {
  return apiRequest<Agent[]>(withCompanyScope("/ai-agents", companyId));
}

export function createAgent(payload: {
  name: string;
  model: string;
  system_prompt: string;
  temperature: number;
  max_context_messages: number;
  active: boolean;
}, companyId?: number) {
  return apiRequest<Agent>(withCompanyScope("/ai-agents", companyId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
