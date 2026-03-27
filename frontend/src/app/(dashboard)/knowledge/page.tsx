"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { KnowledgeForm } from "@/components/forms/knowledge-form";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCompanyScope } from "@/hooks/use-company-scope";
import { useCreateKnowledgeItem, useKnowledgeItems } from "@/hooks/use-knowledge";
import { isDev } from "@/lib/auth/roles";
import { getErrorMessage } from "@/lib/errors";

export default function KnowledgePage() {
  const { user } = useAuth();
  const devMode = isDev(user);
  const companyId = useCompanyScope();
  const knowledgeQuery = useKnowledgeItems(companyId);
  const createMutation = useCreateKnowledgeItem(companyId);

  if (knowledgeQuery.isLoading) {
    return <LoadingState label="Carregando FAQ e informacoes..." description="Organizando conteudos uteis para o atendimento." />;
  }

  if (knowledgeQuery.error) {
    return (
      <ErrorState
        description="Nao foi possivel carregar os itens de conhecimento."
        onRetry={() => void knowledgeQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={devMode ? "Contexto de IA" : "FAQ e Informacoes"}
        title={devMode ? "Base de conhecimento" : "FAQ e informacoes do negocio"}
        description={
          devMode
            ? "Organize os conteudos que alimentam a IA e reduzem respostas imprecisas."
            : "Cadastre respostas frequentes, orientacoes e informacoes importantes para o atendimento."
        }
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo item</DialogTitle>
                <DialogDescription>
                  {devMode ? "Adicione conhecimento estruturado para a IA." : "Adicione perguntas frequentes, regras e informacoes importantes do negocio."}
                </DialogDescription>
              </DialogHeader>
              <KnowledgeForm
                loading={createMutation.isPending}
                onSubmit={async (values) => {
                  try {
                    await createMutation.mutateAsync(values);
                    toast.success("Item criado");
                  } catch (error) {
                    toast.error(getErrorMessage(error, "Nao foi possivel criar o item."));
                  }
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />

      {knowledgeQuery.data?.length ? (
        <DataTable
          rowKey={(item) => item.id}
          columns={[
            { key: "title", header: "Titulo", cell: (item) => <span className="font-medium">{item.title}</span> },
            { key: "category", header: "Categoria", cell: (item) => item.category ?? "-" },
            {
              key: "content",
              header: "Conteudo",
              cell: (item) => <span className="line-clamp-2 max-w-xl">{item.content}</span>
            },
            {
              key: "active",
              header: "Status",
              cell: (item) => <Badge variant={item.active ? "success" : "neutral"}>{item.active ? "Ativo" : "Inativo"}</Badge>
            }
          ]}
          data={knowledgeQuery.data}
        />
      ) : (
        <EmptyState
          title="Sem conteudo ainda"
          description={
            devMode
              ? "Adicione itens para enriquecer as respostas da IA."
              : "Cadastre respostas frequentes e informacoes importantes para melhorar o atendimento."
          }
        />
      )}
    </div>
  );
}
