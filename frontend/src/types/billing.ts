export type Plan = {
  id: number;
  code: string;
  name: string;
  max_messages_per_month: number;
  max_users: number;
  max_whatsapp_instances: number;
  max_ai_tokens_per_month: number;
};

export type Subscription = {
  id: number;
  company_id: number;
  plan_id: number;
  status: string;
  starts_at: string;
  ends_at: string | null;
};
