export type Company = {
  id: number;
  name: string;
  slug: string;
  status: string;
  agent_tone: string | null;
  default_system_prompt?: string | null;
  absence_message: string | null;
  bot_paused: boolean;
  created_at: string;
  updated_at: string;
};

export type CompanyUpdatePayload = Partial<{
  name: string;
  status: string;
  agent_tone: string;
  default_system_prompt: string;
  business_hours: Record<string, unknown>;
  absence_message: string;
  settings: Record<string, unknown>;
  bot_paused: boolean;
}>;

export type CompanyCreatePayload = {
  company_name: string;
  company_slug: string;
  dev_name: string;
  dev_email: string;
  dev_password: string;
};
