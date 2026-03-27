"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { addonSchema, type AddonSchema } from "@/lib/validations/business";
import type { Product, ProductAddon } from "@/types/business";

export function ProductAddonForm({
  products,
  addon,
  loading = false,
  onSubmit
}: {
  products: Product[];
  addon?: ProductAddon | null;
  loading?: boolean;
  onSubmit: (values: AddonSchema) => Promise<void>;
}) {
  const form = useForm<AddonSchema>({
    resolver: zodResolver(addonSchema),
    defaultValues: {
      product_id: 0,
      name: "",
      price: 0,
      active: true
    }
  });

  useEffect(() => {
    form.reset({
      product_id: addon?.product_id ?? 0,
      name: addon?.name ?? "",
      price: addon?.price ?? 0,
      active: addon?.active ?? true
    });
  }, [addon, form]);

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      <FormField label="Produto" error={form.formState.errors.product_id?.message}>
        <select
          className="h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...form.register("product_id")}
        >
          <option value={0}>Selecione um produto</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Nome do adicional" error={form.formState.errors.name?.message}>
        <Input {...form.register("name")} />
      </FormField>
      <FormField label="Preço" error={form.formState.errors.price?.message}>
        <Input type="number" step="0.01" {...form.register("price")} />
      </FormField>
      <div className="rounded-2xl border p-4">
        <p className="font-medium">Adicional ativo</p>
        <p className="mb-3 text-xs text-muted-foreground">Use para controlar a disponibilidade do adicional.</p>
        <Switch checked={form.watch("active")} onCheckedChange={(value) => form.setValue("active", value)} />
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar adicional"}</Button>
    </form>
  );
}
