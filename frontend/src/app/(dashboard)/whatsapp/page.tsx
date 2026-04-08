"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { WhatsappInstanceForm } from "@/components/forms/whatsapp-instance-form";
import { PageHeader } from "@/components/layout/page-header";
import { CompanyScopeSelect } from "@/components/shared/company-scope-select";
import { DataTable } from "@/components/shared/data-table";
import { DevOnlyPage } from "@/components/shared/dev-only-page";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCompany } from "@/hooks/use-company";
import { useCompanyScope } from "@/hooks/use-company-scope";
import { useCreateWhatsappInstance, useWhatsappInstances } from "@/hooks/use-whatsapp";
import { getErrorMessage } from "@/lib/errors";

export default function WhatsappPage() {
  const companyId = useCompanyScope();
  const companyQuery = useCompany(companyId);
  const instancesQuery = useWhatsappInstances(companyId);
  const createMutation = useCreateWhatsappInstance(companyId);
  const targetCompanyName = companyQuery.data?.name ?? "empresa selecionada";

  return (
    <DevOnlyPage>
      {instancesQuery.isLoading ? (
        <LoadingState label="Carregando instancias..." description="Conferindo conexoes ativas com o WhatsApp." />
      ) : instancesQuery.error ? (
        <ErrorState
          description="Nao foi possivel carregar as instancias do WhatsApp."
          onRetry={() => void instancesQuery.refetch()}
        />
      ) : (
        <div className="space-y-6">
          <CompanyScopeSelect />
          <PageHeader
            eyebrow="Canais"
            title="Instancias de WhatsApp"
            description="Conecte, organize e acompanhe as instancias usadas pelas empresas na plataforma."
            actions={
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova instancia
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar instancia</DialogTitle>
                    <DialogDescription>{`Cadastre uma nova conexao com a Evolution API para ${targetCompanyName}.`}</DialogDescription>
                  </DialogHeader>
                  <WhatsappInstanceForm
                    loading={createMutation.isPending}
                    onSubmit={async (values) => {
                      try {
                        await createMutation.mutateAsync({
                          ...values,
                          company_id: companyQuery.data?.id ?? companyId
                        });
                        toast.success("Instancia criada");
                      } catch (error) {
                        toast.error(getErrorMessage(error, "Nao foi possivel criar a instancia."));
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
                { key: "phone", header: "Numero", cell: (item) => item.phone_number ?? "-" },
                {
                  key: "status",
                  header: "Status",
                  cell: (item) => <Badge variant={item.active ? "success" : "neutral"}>{item.active ? "Ativa" : "Inativa"}</Badge>
                }
              ]}
              data={instancesQuery.data}
            />
          ) : (
            <EmptyState title="Nenhuma instancia cadastrada" description="Adicione a primeira instancia para integrar o WhatsApp." />
          )}
        </div>
      )}
    </DevOnlyPage>
  );
}
