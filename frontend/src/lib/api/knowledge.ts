"use client";

import { apiRequest } from "@/lib/api/client";
import { withCompanyScope } from "@/lib/api/company-scope";
import type { KnowledgeItem } from "@/types/ai";

export function getKnowledgeItems(companyId?: number) {
  return apiRequest<KnowledgeItem[]>(withCompanyScope("/knowledge", companyId));
}

export function createKnowledgeItem(payload: {
  title: string;
  content: string;
  category?: string;
  active: boolean;
}, companyId?: number) {
  return apiRequest<KnowledgeItem>(withCompanyScope("/knowledge", companyId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
