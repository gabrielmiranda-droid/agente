import { z } from "zod";

export const manualMessageSchema = z.object({
  content: z.string().min(1, "Digite uma mensagem").max(4000)
});

export type ManualMessageSchema = z.infer<typeof manualMessageSchema>;

