"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { userSchema, type UserSchema } from "@/lib/validations/user";

export function UserForm({
  onSubmit,
  loading = false,
  canCreateDev = false
}: {
  onSubmit: (values: UserSchema) => Promise<void>;
  loading?: boolean;
  canCreateDev?: boolean;
}) {
  const form = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "client"
    }
  });

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      <FormField
        label="Nome"
        description="Nome exibido no histórico, nas atribuições e na rotina da empresa."
        error={form.formState.errors.name?.message}
      >
        <Input {...form.register("name")} placeholder="Nome do usuário" />
      </FormField>

      <FormField
        label="E-mail"
        description="Usado para login e comunicação interna da operação."
        error={form.formState.errors.email?.message}
      >
        <Input {...form.register("email")} placeholder="email@empresa.com" />
      </FormField>

      <FormField
        label="Senha"
        description="Defina uma senha inicial com no mínimo 8 caracteres."
        error={form.formState.errors.password?.message}
      >
        <Input type="password" {...form.register("password")} placeholder="********" />
      </FormField>

      <FormField
        label="Perfil"
        description={
          canCreateDev
            ? "Admin Master tem acesso completo. Operação da Empresa fica restrita ao dia a dia da própria empresa."
            : "A empresa pode criar apenas usuários operacionais para atendimento e gestão do negócio."
        }
        error={form.formState.errors.role?.message}
      >
        <select
          className="h-12 w-full rounded-2xl border border-border/80 bg-background/95 px-4 text-sm font-medium outline-none transition duration-200 hover:border-border focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/10"
          {...form.register("role")}
        >
          <option value="client">Cliente Operacional</option>
          {canCreateDev ? <option value="dev">Admin Master</option> : null}
        </select>
      </FormField>

      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Salvando usuário..." : "Salvar usuário"}
      </Button>
    </form>
  );
}
