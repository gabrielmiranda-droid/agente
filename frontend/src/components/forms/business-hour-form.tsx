"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { businessHourSchema, type BusinessHourSchema } from "@/lib/validations/business";
import type { BusinessHour } from "@/types/business";

const days = ["Domingo", "Segunda-feira", "Terca-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sabado"];

export function BusinessHourForm({
  hour,
  loading = false,
  onSubmit
}: {
  hour?: BusinessHour | null;
  loading?: boolean;
  onSubmit: (values: BusinessHourSchema) => Promise<void>;
}) {
  const form = useForm<BusinessHourSchema>({
    resolver: zodResolver(businessHourSchema),
    defaultValues: {
      day_of_week: 1,
      open_time: "09:00",
      close_time: "18:00",
      active: true
    }
  });

  useEffect(() => {
    form.reset({
      day_of_week: hour?.day_of_week ?? 1,
      open_time: hour?.open_time?.slice(0, 5) ?? "09:00",
      close_time: hour?.close_time?.slice(0, 5) ?? "18:00",
      active: hour?.active ?? true
    });
  }, [hour, form]);

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      <FormField label="Dia da semana">
        <select
          className="h-11 w-full rounded-[1.05rem] border border-border/80 bg-background/88 px-4 text-sm outline-none transition duration-200 hover:border-border focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/10"
          {...form.register("day_of_week")}
        >
          {days.map((day, index) => (
            <option key={day} value={index}>
              {day}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Abertura">
          <Input type="time" {...form.register("open_time")} />
        </FormField>
        <FormField label="Fechamento">
          <Input type="time" {...form.register("close_time")} />
        </FormField>
      </div>

      <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
        <p className="font-medium">Horario ativo</p>
        <p className="mb-3 text-xs text-muted-foreground">Desative dias em que a empresa nao atende.</p>
        <Switch checked={form.watch("active")} onCheckedChange={(value) => form.setValue("active", value)} />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Salvar horario"}
      </Button>
    </form>
  );
}
