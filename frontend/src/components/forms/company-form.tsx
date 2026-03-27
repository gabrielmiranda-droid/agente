"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  companyCreateSchema,
  companySchema,
  type CompanyCreateSchema,
  type CompanySchema
} from "@/lib/validations/company";
import type { Company } from "@/types/company";

export function CompanyCreateForm({
  onSubmit,
  loading = false
}: {
  onSubmit: (values: CompanyCreateSchema) => Promise<void>;
  loading?: boolean;
}) {
  const form = useForm<CompanyCreateSchema>({
    resolver: zodResolver(companyCreateSchema),
    defaultValues: {
      company_name: "",
      company_slug: "",
      dev_name: "",
      dev_email: "",
      dev_password: ""
    }
  });

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      <FormSection
        title="Conta SaaS"
        description="Defina a empresa que sera provisionada e o identificador usado pela plataforma."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Nome da empresa"
            description="Nome comercial da conta no SaaS."
            error={form.formState.errors.company_name?.message}
          >
            <Input {...form.register("company_name")} placeholder="Pizzaria Exemplo" />
          </FormField>
          <FormField
            label="Slug"
            description="Identificador unico da empresa."
            error={form.formState.errors.company_slug?.message}
          >
            <Input {...form.register("company_slug")} placeholder="pizzaria-exemplo" />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title="Acesso inicial"
        description="Esses dados serao usados pelo cliente no primeiro login da conta."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Administrador inicial"
            description="Nome do responsavel principal da empresa."
            error={form.formState.errors.dev_name?.message}
          >
            <Input {...form.register("dev_name")} placeholder="Maria Gestora" />
          </FormField>
          <FormField
            label="E-mail do administrador"
            description="Credencial de acesso inicial."
            error={form.formState.errors.dev_email?.message}
          >
            <Input {...form.register("dev_email")} placeholder="admin@empresa.com" />
          </FormField>
        </div>

        <FormField
          label="Senha inicial"
          description="Senha temporaria para o primeiro acesso."
          error={form.formState.errors.dev_password?.message}
        >
          <Input type="password" {...form.register("dev_password")} placeholder="Senha forte inicial" />
        </FormField>
      </FormSection>

      <Button className="w-full md:w-auto" type="submit" disabled={loading}>
        {loading ? "Criando..." : "Criar empresa"}
      </Button>
    </form>
  );
}

export function CompanyForm({
  company,
  onSubmit,
  loading = false
}: {
  company?: Company;
  onSubmit: (values: CompanySchema) => Promise<void>;
  loading?: boolean;
}) {
  const form = useForm<CompanySchema>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      status: "active",
      agent_tone: "",
      absence_message: "",
      default_system_prompt: "",
      bot_paused: false
    }
  });

  useEffect(() => {
    if (!company) return;
    form.reset({
      name: company.name,
      status: company.status as "active" | "paused" | "inactive",
      agent_tone: company.agent_tone ?? "",
      absence_message: company.absence_message ?? "",
      default_system_prompt: company.default_system_prompt ?? "",
      bot_paused: company.bot_paused
    });
  }, [company, form]);

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      <FormSection
        title="Conta"
        description="Defina status, nome comercial e sinais principais de operacao dessa empresa."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Nome da conta"
            description="Nome comercial exibido na plataforma."
            error={form.formState.errors.name?.message}
          >
            <Input {...form.register("name")} />
          </FormField>
          <FormField
            label="Status da conta"
            description="Controla a disponibilidade operacional da empresa."
            error={form.formState.errors.status?.message}
          >
            <select
              className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm font-medium text-white outline-none transition hover:border-white/20 focus-visible:border-primary"
              {...form.register("status")}
            >
              <option value="active">Ativa</option>
              <option value="paused">Pausada</option>
              <option value="inactive">Inativa</option>
            </select>
          </FormField>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 p-4">
          <div>
            <p className="font-medium text-white">Bot pausado globalmente</p>
            <p className="text-sm text-slate-500">Interrompe a automacao em todas as conversas da empresa.</p>
          </div>
          <Switch checked={form.watch("bot_paused")} onCheckedChange={(value) => form.setValue("bot_paused", value)} />
        </div>
      </FormSection>

      <FormSection
        title="IA e automacao"
        description="Parametros tecnicos usados no comportamento da conta. Essas informacoes nao aparecem para o cliente."
      >
        <FormField
          label="Tom do agente"
          description="Ex.: acolhedor, vendedor e objetivo."
          error={form.formState.errors.agent_tone?.message}
        >
          <Input {...form.register("agent_tone")} placeholder="Profissional, rapido e objetivo" />
        </FormField>

        <FormField
          label="Mensagem de ausencia"
          description="Resposta usada quando a conta estiver indisponivel."
          error={form.formState.errors.absence_message?.message}
        >
          <Textarea {...form.register("absence_message")} placeholder="No momento estamos fora do horario..." />
        </FormField>

        <FormField
          label="Prompt avancado"
          description="Diretriz tecnica do comportamento base do agente."
          error={form.formState.errors.default_system_prompt?.message}
        >
          <Textarea {...form.register("default_system_prompt")} placeholder="Voce e o assistente oficial da operacao..." />
        </FormField>
      </FormSection>

      <Button className="w-full md:w-auto" type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Salvar configuracao"}
      </Button>
    </form>
  );
}
