import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(2, "Informe o nome"),
  email: z.string().email("Informe um e-mail valido"),
  password: z.string().min(8, "A senha precisa ter 8 caracteres"),
  role: z.enum(["client"])
});

export type UserSchema = z.infer<typeof userSchema>;
