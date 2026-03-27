"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { knowledgeSchema, type KnowledgeSchema } from "@/lib/validations/knowledge";

export function KnowledgeForm({
  onSubmit,
  loading = false
}: {
  onSubmit: (values: KnowledgeSchema) => Promise<void>;
  loading?: boolean;
}) {
  const form = useForm<KnowledgeSchema>({
    resolver: zodResolver(knowledgeSchema),
    defaultValues: {
      title: "",
      category: "",
      content: "",
      active: true
    }
  });

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      <FormField
        label="Título"
        description="Nome curto para localizar rapidamente o item."
        error={form.formState.errors.title?.message}
      >
        <Input {...form.register("title")} placeholder="Política de entrega" />
      </FormField>
      <FormField
        label="Categoria"
        description="Agrupe conteúdos por operação, vendas, suporte ou setor."
        error={form.formState.errors.category?.message}
      >
        <Input {...form.register("category")} placeholder="Operação" />
      </FormField>
      <FormField
        label="Conteúdo"
        description="Informação que poderá ser usada para enriquecer as respostas da IA."
        error={form.formState.errors.content?.message}
      >
        <Textarea {...form.register("content")} placeholder="Detalhe a informação da base de conhecimento..." />
      </FormField>
      <div className="flex items-center justify-between rounded-2xl border p-4">
        <div>
          <p className="font-medium">Item ativo</p>
          <p className="text-sm text-muted-foreground">Itens ativos podem entrar no contexto do agente.</p>
        </div>
        <Switch checked={form.watch("active")} onCheckedChange={(value) => form.setValue("active", value)} />
      </div>
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Criando item..." : "Criar item"}
      </Button>
    </form>
  );
}
