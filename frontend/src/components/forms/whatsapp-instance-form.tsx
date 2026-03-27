"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { whatsappSchema, type WhatsappSchema } from "@/lib/validations/whatsapp";

export function WhatsappInstanceForm({
  onSubmit,
  loading = false
}: {
  onSubmit: (values: WhatsappSchema) => Promise<void>;
  loading?: boolean;
}) {
  const form = useForm<WhatsappSchema>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: {
      name: "",
      instance_name: "",
      api_base_url: "",
      api_key: "",
      phone_number: "",
      webhook_secret: "",
      active: true
    }
  });

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      <FormField
        label="Nome"
        description="Rótulo interno da instância para identificar operação ou unidade."
        error={form.formState.errors.name?.message}
      >
        <Input {...form.register("name")} placeholder="Unidade principal" />
      </FormField>
      <FormField
        label="Instance Name"
        description="Nome técnico da instância na Evolution API."
        error={form.formState.errors.instance_name?.message}
      >
        <Input {...form.register("instance_name")} placeholder="tenant-main" />
      </FormField>
      <FormField
        label="Base URL da Evolution"
        description="URL base usada para envio e operações da instância."
        error={form.formState.errors.api_base_url?.message}
      >
        <Input {...form.register("api_base_url")} placeholder="https://evolution.seudominio.com" />
      </FormField>
      <FormField
        label="API Key"
        description="Chave de autenticação da instância na Evolution API."
        error={form.formState.errors.api_key?.message}
      >
        <Input {...form.register("api_key")} placeholder="apikey" />
      </FormField>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Número"
          description="Telefone vinculado à instância, se já estiver disponível."
          error={form.formState.errors.phone_number?.message}
        >
          <Input {...form.register("phone_number")} placeholder="5511999999999" />
        </FormField>
        <FormField
          label="Webhook Secret"
          description="Segredo opcional para validar recebimentos."
          error={form.formState.errors.webhook_secret?.message}
        >
          <Input {...form.register("webhook_secret")} placeholder="segredo-opcional" />
        </FormField>
      </div>
      <div className="flex items-center justify-between rounded-2xl border p-4">
        <div>
          <p className="font-medium">Instância ativa</p>
          <p className="text-sm text-muted-foreground">Apenas instâncias ativas recebem processamento.</p>
        </div>
        <Switch checked={form.watch("active")} onCheckedChange={(value) => form.setValue("active", value)} />
      </div>
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Criando instância..." : "Criar instância"}
      </Button>
    </form>
  );
}
