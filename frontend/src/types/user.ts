import type { AppRole } from "@/lib/auth/roles";

export type User = {
  id: number;
  company_id: number;
  name: string;
  email: string;
  role?: AppRole | null;
  is_active: boolean;
  created_at: string;
};
