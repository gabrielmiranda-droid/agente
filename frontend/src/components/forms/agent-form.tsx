"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { agentSchema, type AgentSchema } from "@/lib/validations/agent";

export function AgentForm({
  onSubmit,
  loading = false
}: {
  onSubmit: (values: AgentSchema) => Promise<void>;
  loading?: boolean;
}) {
  const form = useForm<AgentSchema>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: "",
      model: "gpt-4.1-mini",
      system_prompt: "",
      temperature: 0.3,
      max_context_messages: 12,
      active: true
    }
  });

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      <FormField
        label="Nome"
        description="Identificação usada na operação e em futuras automações."
        error={form.formState.errors.name?.message}
      >
        <Input {...form.register("name")} placeholder="Agente Comercial" />
      </FormField>
      <FormField
        label="Modelo"
        description="Modelo principal utilizado para gerar respostas."
        error={form.formState.errors.model?.message}
      >
        <Input {...form.register("model")} placeholder="gpt-4.1-mini" />
      </FormField>
      <FormField
        label="Prompt do sistema"
        description="Defina persona, limites e estilo de atendimento do agente."
        error={form.formState.errors.system_prompt?.message}
      >
        <Textarea {...form.register("system_prompt")} placeholder="Defina a persona e as regras do agente..." />
      </FormField>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Temperatura"
          description="Valores menores deixam o agente mais consistente."
          error={form.formState.errors.temperature?.message}
        >
          <Input type="number" step="0.1" {...form.register("temperature")} />
        </FormField>
        <FormField
          label="Limite de contexto"
          description="Número de mensagens históricas usadas no contexto."
          error={form.formState.errors.max_context_messages?.message}
        >
          <Input type="number" {...form.register("max_context_messages")} />
        </FormField>
      </div>
      <div className="flex items-center justify-between rounded-2xl border p-4">
        <div>
          <p className="font-medium">Agente ativo</p>
          <p className="text-sm text-muted-foreground">Apenas agentes ativos podem ser usados no atendimento.</p>
        </div>
        <Switch checked={form.watch("active")} onCheckedChange={(value) => form.setValue("active", value)} />
      </div>
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Criando agente..." : "Criar agente"}
      </Button>
    </form>
  );
}
