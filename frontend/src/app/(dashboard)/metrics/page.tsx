"use client";

import { AreaChart, BarChart3, Coins, MessageCircleCode } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { DevOnlyPage } from "@/components/shared/dev-only-page";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { useCompanyScope } from "@/hooks/use-company-scope";
import { useMetrics } from "@/hooks/use-metrics";
import { formatCurrencyUsd, formatDate } from "@/lib/formatters";

export default function MetricsPage() {
  const companyId = useCompanyScope();
  const metricsQuery = useMetrics(companyId);

  return (
    <DevOnlyPage>
      {metricsQuery.isLoading ? (
        <LoadingState label="Carregando métricas..." description="Consolidando indicadores de uso da plataforma." />
      ) : metricsQuery.error ? (
        <ErrorState description="Não foi possível carregar os indicadores." onRetry={() => void metricsQuery.refetch()} />
      ) : (
        <MetricsContent metrics={metricsQuery.data ?? []} />
      )}
    </DevOnlyPage>
  );
}

function MetricsContent({
  metrics
}: {
  metrics: Array<{ metric_date: string; metric_name: string; metric_value: number; estimated_cost: number }>;
}) {
  const totalMessages = metrics
    .filter((item) => item.metric_name.includes("messages"))
    .reduce((acc, item) => acc + item.metric_value, 0);
  const totalHandoffs = metrics
    .filter((item) => item.metric_name.includes("handoff"))
    .reduce((acc, item) => acc + item.metric_value, 0);
  const totalCost = metrics.reduce((acc, item) => acc + item.estimated_cost, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Métricas"
        title="Indicadores da plataforma"
        description="Acompanhe volume, handoffs e custo estimado em uma visão consolidada para o painel master."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Mensagens" value={totalMessages} icon={MessageCircleCode} />
        <StatCard title="Handoffs" value={totalHandoffs} icon={BarChart3} />
        <StatCard title="Custo estimado" value={formatCurrencyUsd(totalCost)} icon={Coins} />
        <StatCard title="Séries" value={metrics.length} icon={AreaChart} />
      </div>

      {metrics.length ? (
        <DataTable
          rowKey={(item) => `${item.metric_name}-${item.metric_date}`}
          columns={[
            { key: "metric_date", header: "Data", cell: (item) => formatDate(item.metric_date) },
            { key: "metric_name", header: "Indicador", cell: (item) => item.metric_name },
            { key: "metric_value", header: "Valor", cell: (item) => item.metric_value },
            { key: "estimated_cost", header: "Custo estimado", cell: (item) => formatCurrencyUsd(item.estimated_cost) }
          ]}
          data={metrics}
        />
      ) : (
        <EmptyState title="Nenhum dado disponível" description="As métricas aparecerão conforme a plataforma for utilizada." />
      )}
    </div>
  );
}
