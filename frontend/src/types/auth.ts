import type { AppRole } from "@/lib/auth/roles";

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type CurrentUser = {
  id: number;
  company_id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  role: AppRole;
};
