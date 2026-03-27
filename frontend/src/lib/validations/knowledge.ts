import { z } from "zod";

export const knowledgeSchema = z.object({
  title: z.string().min(2),
  category: z.string().trim().optional().or(z.literal("")),
  content: z.string().min(10),
  active: z.boolean()
});

export type KnowledgeSchema = z.infer<typeof knowledgeSchema>;
