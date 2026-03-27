import { z } from "zod";

const optionalText = z.string().trim().optional().or(z.literal(""));

export const companySchema = z.object({
  name: z.string().min(2, "Informe o nome da empresa"),
  status: z.enum(["active", "paused", "inactive"]),
  agent_tone: optionalText,
  absence_message: optionalText,
  default_system_prompt: optionalText,
  bot_paused: z.boolean()
});

export const companyCreateSchema = z.object({
  company_name: z.string().min(2, "Informe o nome da empresa"),
  company_slug: z.string().min(2, "Informe o slug da empresa"),
  dev_name: z.string().min(2, "Informe o nome do administrador"),
  dev_email: z.string().email("Informe um e-mail valido"),
  dev_password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres")
});

export type CompanySchema = z.infer<typeof companySchema>;
export type CompanyCreateSchema = z.infer<typeof companyCreateSchema>;
