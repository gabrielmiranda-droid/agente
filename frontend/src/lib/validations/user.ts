import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(2, "Informe o nome"),
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(8, "A senha precisa ter 8 caracteres"),
  role: z.enum(["dev", "attendant"])
});

export type UserSchema = z.infer<typeof userSchema>;
