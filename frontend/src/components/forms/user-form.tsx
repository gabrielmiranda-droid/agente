"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { userSchema, type UserSchema } from "@/lib/validations/user";

export function UserForm({
  onSubmit,
  loading = false
}: {
  onSubmit: (values: UserSchema) => Promise<void>;
  loading?: boolean;
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
        description="Nome exibido no dia a dia da operacao da empresa."
        error={form.formState.errors.name?.message}
      >
        <Input {...form.register("name")} placeholder="Nome do cliente" />
      </FormField>

      <FormField
        label="E-mail"
        description="Usado para login no painel do cliente."
        error={form.formState.errors.email?.message}
      >
        <Input {...form.register("email")} placeholder="cliente@empresa.com" />
      </FormField>

      <FormField
        label="Senha"
        description="Defina uma senha inicial com no minimo 8 caracteres."
        error={form.formState.errors.password?.message}
      >
        <Input type="password" {...form.register("password")} placeholder="********" />
      </FormField>

      <FormField
        label="Perfil"
        description="O painel master cria apenas usuarios cliente para a operacao da empresa."
        error={form.formState.errors.role?.message}
      >
        <select
          className="h-11 w-full rounded-[1.05rem] border border-border/80 bg-background/88 px-4 text-sm outline-none transition duration-200 hover:border-border focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/10"
          {...form.register("role")}
        >
          <option value="client">Cliente Operacional</option>
        </select>
      </FormField>

      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Salvando usuario..." : "Salvar usuario"}
      </Button>
    </form>
  );
}
