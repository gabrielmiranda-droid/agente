"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { categorySchema, type CategorySchema } from "@/lib/validations/business";
import type { ProductCategory } from "@/types/business";

export function BusinessCategoryForm({
  category,
  loading = false,
  onSubmit
}: {
  category?: ProductCategory | null;
  loading?: boolean;
  onSubmit: (values: CategorySchema) => Promise<void>;
}) {
  const form = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", active: true }
  });

  useEffect(() => {
    form.reset({ name: category?.name ?? "", active: category?.active ?? true });
  }, [category, form]);

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      <FormField label="Nome da categoria" error={form.formState.errors.name?.message}>
        <Input {...form.register("name")} />
      </FormField>
      <div className="rounded-2xl border p-4">
        <p className="font-medium">Categoria ativa</p>
        <p className="mb-3 text-xs text-muted-foreground">Categorias inativas não aparecem na operação.</p>
        <Switch checked={form.watch("active")} onCheckedChange={(value) => form.setValue("active", value)} />
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar categoria"}</Button>
    </form>
  );
}
