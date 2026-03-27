"use client";

import { apiRequest } from "@/lib/api/client";
import { withCompanyScope } from "@/lib/api/company-scope";
import type { WhatsappInstance } from "@/types/whatsapp";

export function getWhatsappInstances(companyId?: number) {
  return apiRequest<WhatsappInstance[]>(withCompanyScope("/whatsapp-instances", companyId));
}

export function createWhatsappInstance(payload: {
  name: string;
  instance_name: string;
  api_base_url: string;
  api_key: string;
  phone_number?: string;
  webhook_secret?: string;
  active: boolean;
}, companyId?: number) {
  return apiRequest<WhatsappInstance>(withCompanyScope("/whatsapp-instances", companyId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
