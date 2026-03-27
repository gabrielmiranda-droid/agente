"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { AgentForm } from "@/components/forms/agent-form";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { DevOnlyPage } from "@/components/shared/dev-only-page";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCompanyScope } from "@/hooks/use-company-scope";
import { useAgents, useCreateAgent } from "@/hooks/use-agents";
import { getErrorMessage } from "@/lib/errors";

export default function AgentsPage() {
  const companyId = useCompanyScope();
  const agentsQuery = useAgents(companyId);
  const createMutation = useCreateAgent(companyId);

  return (
    <DevOnlyPage>
      <AgentsContent agentsQuery={agentsQuery} createMutation={createMutation} />
    </DevOnlyPage>
  );
}

function AgentsContent({
  agentsQuery,
  createMutation
}: {
  agentsQuery: ReturnType<typeof useAgents>;
  createMutation: ReturnType<typeof useCreateAgent>;
}) {
  if (agentsQuery.isLoading) {
    return <LoadingState label="Carregando agentes..." description="Buscando personas, modelos e parâmetros ativos." />;
  }

  if (agentsQuery.error) {
    return (
      <ErrorState
        description="Não foi possível carregar os agentes de IA."
        onRetry={() => void agentsQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Automação"
        title="Agentes de IA"
        description="Gerencie personas, modelos e parâmetros operacionais do atendimento."
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo agente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar agente</DialogTitle>
                <DialogDescription>Configure um novo agente para a empresa.</DialogDescription>
              </DialogHeader>
              <AgentForm
                loading={createMutation.isPending}
                onSubmit={async (values) => {
                  try {
                    await createMutation.mutateAsync(values);
                    toast.success("Agente criado");
                  } catch (error) {
                    toast.error(getErrorMessage(error, "Não foi possível criar o agente."));
                  }
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />
      {agentsQuery.data?.length ? (
        <DataTable
          rowKey={(item) => item.id}
          columns={[
            { key: "name", header: "Agente", cell: (item) => <span className="font-medium">{item.name}</span> },
            { key: "model", header: "Modelo", cell: (item) => item.model },
            { key: "temperature", header: "Temperatura", cell: (item) => item.temperature.toFixed(1) },
            { key: "context", header: "Contexto", cell: (item) => item.max_context_messages },
            {
              key: "active",
              header: "Status",
              cell: (item) => <Badge variant={item.active ? "success" : "neutral"}>{item.active ? "Ativo" : "Inativo"}</Badge>
            }
          ]}
          data={agentsQuery.data}
        />
      ) : (
        <EmptyState title="Nenhum agente criado" description="Cadastre um agente para começar a automação." />
      )}
    </div>
  );
}
