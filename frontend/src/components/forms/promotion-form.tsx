"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { promotionSchema, type PromotionSchema } from "@/lib/validations/business";
import type { Promotion } from "@/types/business";

export function PromotionForm({
  promotion,
  loading = false,
  onSubmit
}: {
  promotion?: Promotion | null;
  loading?: boolean;
  onSubmit: (values: PromotionSchema) => Promise<void>;
}) {
  const form = useForm<PromotionSchema>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      title: "",
      description: "",
      active: true,
      start_date: "",
      end_date: ""
    }
  });

  useEffect(() => {
    form.reset({
      title: promotion?.title ?? "",
      description: promotion?.description ?? "",
      active: promotion?.active ?? true,
      start_date: promotion?.start_date ?? "",
      end_date: promotion?.end_date ?? ""
    });
  }, [promotion, form]);

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      <FormField label="Título da promoção" error={form.formState.errors.title?.message}>
        <Input {...form.register("title")} />
      </FormField>
      <FormField label="Descrição">
        <Textarea {...form.register("description")} />
      </FormField>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Data inicial">
          <Input type="date" {...form.register("start_date")} />
        </FormField>
        <FormField label="Data final">
          <Input type="date" {...form.register("end_date")} />
        </FormField>
      </div>
      <div className="rounded-2xl border p-4">
        <p className="font-medium">Promoção ativa</p>
        <p className="mb-3 text-xs text-muted-foreground">Promoções ativas entram no contexto comercial da IA.</p>
        <Switch checked={form.watch("active")} onCheckedChange={(value) => form.setValue("active", value)} />
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar promoção"}</Button>
    </form>
  );
}
