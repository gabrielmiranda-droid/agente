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
import { businessProfileSchema, type BusinessProfileSchema } from "@/lib/validations/business";
import type { BusinessProfile } from "@/types/business";

export function BusinessProfileForm({
  profile,
  loading = false,
  onSubmit
}: {
  profile?: BusinessProfile;
  loading?: boolean;
  onSubmit: (values: BusinessProfileSchema) => Promise<void>;
}) {
  const form = useForm<BusinessProfileSchema>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      business_name: "",
      phone: "",
      address: "",
      city: "",
      neighborhood: "",
      delivery_fee: null,
      estimated_delivery_time: "",
      accepts_pickup: true,
      payment_methods_text: "",
      welcome_message: "",
      out_of_hours_message: ""
    }
  });

  useEffect(() => {
    if (!profile) return;
    form.reset({
      business_name: profile.business_name,
      phone: profile.phone ?? "",
      address: profile.address ?? "",
      city: profile.city ?? "",
      neighborhood: profile.neighborhood ?? "",
      delivery_fee: profile.delivery_fee,
      estimated_delivery_time: profile.estimated_delivery_time ?? "",
      accepts_pickup: profile.accepts_pickup,
      payment_methods_text: (profile.payment_methods ?? []).join(", "),
      welcome_message: profile.welcome_message ?? "",
      out_of_hours_message: profile.out_of_hours_message ?? ""
    });
  }, [profile, form]);

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      <FormSection
        title="Dados da loja"
        description="Essas informacoes ajudam o atendimento a explicar quem e a sua loja e onde ela atende."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Nome da loja" error={form.formState.errors.business_name?.message}>
            <Input {...form.register("business_name")} />
          </FormField>
          <FormField label="Telefone" error={form.formState.errors.phone?.message}>
            <Input {...form.register("phone")} placeholder="(11) 99999-9999" />
          </FormField>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Endereco">
            <Input {...form.register("address")} />
          </FormField>
          <FormField label="Bairro">
            <Input {...form.register("neighborhood")} />
          </FormField>
          <FormField label="Cidade">
            <Input {...form.register("city")} />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title="Entrega e retirada"
        description="Defina o basico da operacao para o atendimento responder corretamente sobre o delivery."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Taxa de entrega">
            <Input type="number" step="0.01" {...form.register("delivery_fee")} />
          </FormField>
          <FormField label="Tempo estimado">
            <Input {...form.register("estimated_delivery_time")} placeholder="30 a 45 min" />
          </FormField>
          <div className="rounded-2xl border bg-background/85 p-4">
            <p className="font-medium">Retirada no local</p>
            <p className="mb-3 text-xs text-muted-foreground">Ative se o cliente puder buscar o pedido na loja.</p>
            <Switch checked={form.watch("accepts_pickup")} onCheckedChange={(value) => form.setValue("accepts_pickup", value)} />
          </div>
        </div>
        <FormField label="Formas de pagamento" description="Separe por virgula. Ex.: PIX, Cartao, Dinheiro">
          <Input {...form.register("payment_methods_text")} />
        </FormField>
      </FormSection>

      <FormSection
        title="Mensagens automaticas"
        description="Esses textos ajudam a loja a manter consistencia no primeiro contato e fora do horario."
      >
        <FormField label="Mensagem de boas-vindas">
          <Textarea {...form.register("welcome_message")} />
        </FormField>
        <FormField label="Mensagem fora do horario">
          <Textarea {...form.register("out_of_hours_message")} />
        </FormField>
      </FormSection>

      <Button type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Salvar informacoes"}
      </Button>
    </form>
  );
}
