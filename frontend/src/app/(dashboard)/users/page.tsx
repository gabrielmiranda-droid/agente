"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { UserForm } from "@/components/forms/user-form";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCreateUser, useUsers } from "@/hooks/use-users";
import { useCompanyScope } from "@/hooks/use-company-scope";
import { getRoleLabel, isDev } from "@/lib/auth/roles";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/formatters";

export default function UsersPage() {
  const { user } = useAuth();
  const companyId = useCompanyScope();
  const usersQuery = useUsers(companyId);
  const createMutation = useCreateUser(companyId);
  const devMode = isDev(user);

  if (usersQuery.isLoading) {
    return <LoadingState label="Carregando equipe..." description="Buscando usuarios vinculados a empresa." />;
  }

  if (usersQuery.error) {
    return <ErrorState description="Nao foi possivel carregar a equipe." onRetry={() => void usersQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={devMode ? "Acessos" : "Equipe"}
        title={devMode ? "Equipe e acessos" : "Equipe da empresa"}
        description={
          devMode
            ? "Gerencie usuarios da empresa ativa e acompanhe quem esta habilitado para operar o sistema."
            : "Cadastre atendentes e organize quem pode acessar a operacao da empresa."
        }
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo usuario</DialogTitle>
                <DialogDescription>
                  {devMode ? "Cadastre um usuario para a empresa ativa." : "Adicione um novo atendente para apoiar a operacao do negocio."}
                </DialogDescription>
              </DialogHeader>
              <UserForm
                canCreateDev={devMode}
                loading={createMutation.isPending}
                onSubmit={async (values) => {
                  try {
                    await createMutation.mutateAsync(values);
                    toast.success("Usuario criado");
                  } catch (error) {
                    toast.error(getErrorMessage(error, "Nao foi possivel criar o usuario."));
                  }
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />

      {usersQuery.data?.length ? (
        <DataTable
          rowKey={(item) => item.id}
          columns={[
            { key: "name", header: "Nome", cell: (item) => <span className="font-medium">{item.name}</span> },
            { key: "email", header: "E-mail", cell: (item) => item.email },
            { key: "role", header: "Perfil", cell: (item) => <Badge variant="neutral">{getRoleLabel(item.role)}</Badge> },
            {
              key: "status",
              header: "Status",
              cell: (item) => <Badge variant={item.is_active ? "success" : "neutral"}>{item.is_active ? "Ativo" : "Inativo"}</Badge>
            },
            { key: "created", header: "Criado em", cell: (item) => formatDate(item.created_at) }
          ]}
          data={usersQuery.data}
        />
      ) : (
        <EmptyState
          title="Nenhum usuario cadastrado"
          description={
            devMode
              ? "Cadastre o primeiro usuario para estruturar a operacao desta empresa."
              : "Adicione atendentes para dividir a operacao e o acompanhamento das conversas."
          }
        />
      )}
    </div>
  );
}
