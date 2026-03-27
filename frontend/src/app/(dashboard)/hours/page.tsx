"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { BusinessHourForm } from "@/components/forms/business-hour-form";
import { PageHeader } from "@/components/layout/page-header";
import { CompanyScopeSelect } from "@/components/shared/company-scope-select";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useBusinessHours, useBusinessMutations } from "@/hooks/use-business";
import { useCompanyScope } from "@/hooks/use-company-scope";
import { getErrorMessage } from "@/lib/errors";
import type { BusinessHour } from "@/types/business";

const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default function HoursPage() {
  const companyId = useCompanyScope();
  const hoursQuery = useBusinessHours(companyId);
  const mutations = useBusinessMutations(companyId);
  const [editingHour, setEditingHour] = useState<BusinessHour | null>(null);

  if (hoursQuery.isLoading) {
    return <LoadingState label="Carregando horários..." description="Buscando o horário de funcionamento da loja." />;
  }

  if (hoursQuery.error) {
    return <ErrorState description="Não foi possível carregar os horários." onRetry={() => void hoursQuery.refetch()} />;
  }

  const hours = hoursQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Horários"
        title="Horários de funcionamento"
        description="Defina os dias e horários em que sua loja atende, entrega e permite retirada."
      />
      <CompanyScopeSelect />
      <SectionCard
        title="Funcionamento semanal"
        description="Use um horário por dia da semana e deixe fechado quando não houver atendimento."
        actions={
          <Dialog onOpenChange={(open) => !open && setEditingHour(null)}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo horário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingHour ? "Editar horário" : "Novo horário"}</DialogTitle>
                <DialogDescription>Defina a janela de atendimento para um dia da semana.</DialogDescription>
              </DialogHeader>
              <BusinessHourForm
                hour={editingHour}
                loading={mutations.createBusinessHourMutation.isPending || mutations.updateBusinessHourMutation.isPending}
                onSubmit={async (values) => {
                  try {
                    if (editingHour) {
                      await mutations.updateBusinessHourMutation.mutateAsync({ id: editingHour.id, payload: values });
                      toast.success("Horário atualizado");
                    } else {
                      await mutations.createBusinessHourMutation.mutateAsync(values);
                      toast.success("Horário criado");
                    }
                    setEditingHour(null);
                  } catch (error) {
                    toast.error(getErrorMessage(error, "Não foi possível salvar o horário."));
                  }
                }}
              />
            </DialogContent>
          </Dialog>
        }
      >
        {hours.length ? (
          <DataTable
            rowKey={(item) => item.id}
            data={hours}
            columns={[
              { key: "day", header: "Dia", cell: (item) => days[item.day_of_week] ?? `Dia ${item.day_of_week}` },
              { key: "open", header: "Abre", cell: (item) => item.open_time.slice(0, 5) },
              { key: "close", header: "Fecha", cell: (item) => item.close_time.slice(0, 5) },
              {
                key: "active",
                header: "Status",
                cell: (item) => <Badge variant={item.active ? "success" : "neutral"}>{item.active ? "Aberto" : "Fechado"}</Badge>
              },
              {
                key: "actions",
                header: "Ação",
                cell: (item) => (
                  <Button variant="outline" size="sm" onClick={() => setEditingHour(item)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Editar
                  </Button>
                )
              }
            ]}
          />
        ) : (
          <EmptyState title="Sem horários cadastrados" description="Cadastre o horário de funcionamento da sua loja." />
        )}
      </SectionCard>
    </div>
  );
}
