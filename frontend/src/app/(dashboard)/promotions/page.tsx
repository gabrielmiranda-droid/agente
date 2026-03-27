"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { PromotionForm } from "@/components/forms/promotion-form";
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
import { useBusinessMutations, usePromotions } from "@/hooks/use-business";
import { useCompanyScope } from "@/hooks/use-company-scope";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/formatters";
import type { Promotion } from "@/types/business";

export default function PromotionsPage() {
  const companyId = useCompanyScope();
  const promotionsQuery = usePromotions(companyId);
  const mutations = useBusinessMutations(companyId);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  if (promotionsQuery.isLoading) {
    return <LoadingState label="Carregando promoções..." description="Buscando campanhas ativas da loja." />;
  }

  if (promotionsQuery.error) {
    return <ErrorState description="Não foi possível carregar as promoções." onRetry={() => void promotionsQuery.refetch()} />;
  }

  const promotions = promotionsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Promoções"
        title="Promoções e campanhas"
        description="Cadastre ofertas, combos e campanhas sazonais para o atendimento responder com as promoções corretas."
      />
      <CompanyScopeSelect />
      <SectionCard
        title="Campanhas da loja"
        description="Use promoções para destacar pratos, lanches, combos e condições especiais."
        actions={
          <Dialog onOpenChange={(open) => !open && setEditingPromotion(null)}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova promoção
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingPromotion ? "Editar promoção" : "Nova promoção"}</DialogTitle>
                <DialogDescription>Defina uma campanha ativa para divulgar no atendimento.</DialogDescription>
              </DialogHeader>
              <PromotionForm
                promotion={editingPromotion}
                loading={mutations.createPromotionMutation.isPending || mutations.updatePromotionMutation.isPending}
                onSubmit={async (values) => {
                  try {
                    const payload = {
                      ...values,
                      description: values.description || null,
                      start_date: values.start_date || null,
                      end_date: values.end_date || null
                    };
                    if (editingPromotion) {
                      await mutations.updatePromotionMutation.mutateAsync({ id: editingPromotion.id, payload });
                      toast.success("Promoção atualizada");
                    } else {
                      await mutations.createPromotionMutation.mutateAsync(payload);
                      toast.success("Promoção criada");
                    }
                    setEditingPromotion(null);
                  } catch (error) {
                    toast.error(getErrorMessage(error, "Não foi possível salvar a promoção."));
                  }
                }}
              />
            </DialogContent>
          </Dialog>
        }
      >
        {promotions.length ? (
          <DataTable
            rowKey={(item) => item.id}
            data={promotions}
            columns={[
              { key: "title", header: "Título", cell: (item) => <span className="font-medium">{item.title}</span> },
              { key: "description", header: "Descrição", cell: (item) => <span className="line-clamp-2 max-w-xl">{item.description ?? "—"}</span> },
              { key: "period", header: "Período", cell: (item) => `${formatDate(item.start_date)} até ${formatDate(item.end_date)}` },
              {
                key: "active",
                header: "Status",
                cell: (item) => <Badge variant={item.active ? "success" : "neutral"}>{item.active ? "Ativa" : "Inativa"}</Badge>
              },
              {
                key: "actions",
                header: "Ação",
                cell: (item) => (
                  <Button variant="outline" size="sm" onClick={() => setEditingPromotion(item)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Editar
                  </Button>
                )
              }
            ]}
          />
        ) : (
          <EmptyState title="Sem promoções cadastradas" description="Cadastre campanhas para divulgar ofertas e combos." />
        )}
      </SectionCard>
    </div>
  );
}
