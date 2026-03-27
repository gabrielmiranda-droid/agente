"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { WhatsappInstanceForm } from "@/components/forms/whatsapp-instance-form";
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
import { useCreateWhatsappInstance, useWhatsappInstances } from "@/hooks/use-whatsapp";
import { getErrorMessage } from "@/lib/errors";

export default function WhatsappPage() {
  const companyId = useCompanyScope();
  const instancesQuery = useWhatsappInstances(companyId);
  const createMutation = useCreateWhatsappInstance(companyId);

  return (
    <DevOnlyPage>
      {instancesQuery.isLoading ? (
        <LoadingState label="Carregando instâncias..." description="Conferindo conexões ativas com o WhatsApp." />
      ) : instancesQuery.error ? (
        <ErrorState
          description="Não foi possível carregar as instâncias do WhatsApp."
          onRetry={() => void instancesQuery.refetch()}
        />
      ) : (
        <div className="space-y-6">
          <PageHeader
            eyebrow="Canais"
            title="Instâncias de WhatsApp"
            description="Conecte, organize e acompanhe as instâncias usadas pelas empresas na plataforma."
            actions={
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova instância
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar instância</DialogTitle>
                    <DialogDescription>Cadastre uma nova conexão com a Evolution API.</DialogDescription>
                  </DialogHeader>
                  <WhatsappInstanceForm
                    loading={createMutation.isPending}
                    onSubmit={async (values) => {
                      try {
                        await createMutation.mutateAsync(values);
                        toast.success("Instância criada");
                      } catch (error) {
                        toast.error(getErrorMessage(error, "Não foi possível criar a instância."));
                      }
                    }}
                  />
                </DialogContent>
              </Dialog>
            }
          />

          {instancesQuery.data?.length ? (
            <DataTable
              rowKey={(item) => item.id}
              columns={[
                { key: "name", header: "Nome", cell: (item) => <span className="font-medium">{item.name}</span> },
                { key: "instance_name", header: "Instance name", cell: (item) => item.instance_name },
                { key: "phone", header: "Número", cell: (item) => item.phone_number ?? "—" },
                {
                  key: "status",
                  header: "Status",
                  cell: (item) => <Badge variant={item.active ? "success" : "neutral"}>{item.active ? "Ativa" : "Inativa"}</Badge>
                }
              ]}
              data={instancesQuery.data}
            />
          ) : (
            <EmptyState title="Nenhuma instância cadastrada" description="Adicione a primeira instância para integrar o WhatsApp." />
          )}
        </div>
      )}
    </DevOnlyPage>
  );
}
