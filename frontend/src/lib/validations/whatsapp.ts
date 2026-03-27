import { z } from "zod";

export const whatsappSchema = z.object({
  name: z.string().min(2),
  instance_name: z.string().min(2),
  api_base_url: z.string().url("Informe uma URL válida"),
  api_key: z.string().min(1),
  phone_number: z.string().trim().optional().or(z.literal("")),
  webhook_secret: z.string().trim().optional().or(z.literal("")),
  active: z.boolean()
});

export type WhatsappSchema = z.infer<typeof whatsappSchema>;
