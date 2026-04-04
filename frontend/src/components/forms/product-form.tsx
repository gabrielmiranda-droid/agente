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
import { productSchema, type ProductSchema } from "@/lib/validations/business";
import type { Product, ProductCategory } from "@/types/business";

export function ProductForm({
  categories,
  product,
  loading = false,
  onSubmit
}: {
  categories: ProductCategory[];
  product?: Product | null;
  loading?: boolean;
  onSubmit: (values: ProductSchema) => Promise<void>;
}) {
  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category_id: null,
      name: "",
      description: "",
      price: 0,
      promotional_price: null,
      active: true,
      featured: false,
      display_order: 0
    }
  });

  useEffect(() => {
    form.reset({
      category_id: product?.category_id ?? null,
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      promotional_price: product?.promotional_price ?? null,
      active: product?.active ?? true,
      featured: product?.featured ?? false,
      display_order: product?.display_order ?? 0
    });
  }, [product, form]);

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      <FormSection title="Informacoes principais" description="Cadastre o produto de um jeito simples para a empresa manter o cardapio atualizado.">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Categoria">
            <select
              className="h-11 w-full rounded-[1.05rem] border border-border/80 bg-background/88 px-4 text-sm outline-none transition duration-200 hover:border-border focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/10"
              {...form.register("category_id", { setValueAs: (value) => (value ? Number(value) : null) })}
            >
              <option value="">Sem categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Nome do produto" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} />
          </FormField>
        </div>

        <FormField label="Descricao">
          <Textarea {...form.register("description")} />
        </FormField>
      </FormSection>

      <FormSection title="Precos e destaque" description="Defina preco padrao, promocao e prioridade de exibicao.">
        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Preco" error={form.formState.errors.price?.message}>
            <Input type="number" step="0.01" {...form.register("price")} />
          </FormField>
          <FormField label="Preco promocional">
            <Input type="number" step="0.01" {...form.register("promotional_price")} />
          </FormField>
          <FormField label="Ordem de exibicao">
            <Input type="number" {...form.register("display_order")} />
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
            <p className="font-medium">Produto ativo</p>
            <p className="mb-3 text-xs text-muted-foreground">Produtos inativos nao entram no contexto da IA.</p>
            <Switch checked={form.watch("active")} onCheckedChange={(value) => form.setValue("active", value)} />
          </div>

          <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
            <p className="font-medium">Produto em destaque</p>
            <p className="mb-3 text-xs text-muted-foreground">Destaques podem aparecer com prioridade no contexto.</p>
            <Switch checked={form.watch("featured")} onCheckedChange={(value) => form.setValue("featured", value)} />
          </div>
        </div>
      </FormSection>

      <Button type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Salvar produto"}
      </Button>
    </form>
  );
}
