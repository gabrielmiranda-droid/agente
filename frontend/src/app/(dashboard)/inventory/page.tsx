"use client";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyScope } from "@/hooks/use-company-scope";
import { useOperationalInventory } from "@/hooks/use-operations";

export default function InventoryPage() {
  const companyId = useCompanyScope();
  const inventoryQuery = useOperationalInventory(companyId);

  if (inventoryQuery.isLoading) {
    return <LoadingState label="Carregando estoque..." description="Buscando disponibilidade, alerta e saldo atual." />;
  }

  if (inventoryQuery.error) {
    return <ErrorState description="Nao foi possivel carregar o estoque." onRetry={() => void inventoryQuery.refetch()} />;
  }

  const items = inventoryQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Estoque"
        title="Controle de disponibilidade"
        description="Itens vinculados a produtos, com saldo atual, nivel minimo e disponibilidade para venda."
      />

      <Card className="border-white/8 bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-base text-white">Itens de estoque</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length ? (
            items.map((item) => {
              const low = item.current_quantity <= item.low_stock_threshold;
              return (
                <div key={item.id} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {item.current_quantity} {item.unit} • minimo {item.low_stock_threshold} {item.unit}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={low ? "warning" : "success"}>{low ? "Estoque baixo" : "Disponivel"}</Badge>
                      <Badge variant={item.available_for_sale ? "neutral" : "danger"}>
                        {item.available_for_sale ? "Venda liberada" : "Venda bloqueada"}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState title="Sem itens cadastrados" description="Cadastre os insumos da operacao para ativar baixa por venda e alertas." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
