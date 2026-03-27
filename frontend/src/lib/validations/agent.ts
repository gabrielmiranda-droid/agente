import { z } from "zod";

export const agentSchema = z.object({
  name: z.string().min(2),
  model: z.string().min(2),
  system_prompt: z.string().min(10),
  temperature: z.coerce.number().min(0).max(1.5),
  max_context_messages: z.coerce.number().min(1).max(50),
  active: z.boolean()
});

export type AgentSchema = z.infer<typeof agentSchema>;

