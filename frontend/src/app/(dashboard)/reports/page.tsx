"use client";

import { BarChart3, CircleDollarSign, ClipboardList, MessageCircleMore } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyScope } from "@/hooks/use-company-scope";
import { useConversations } from "@/hooks/use-conversations";
import { useMetrics } from "@/hooks/use-metrics";
import { formatCompactNumber, formatDate } from "@/lib/formatters";

export default function ReportsPage() {
  const companyId = useCompanyScope();
  const conversationsQuery = useConversations(companyId);
  const metricsQuery = useMetrics(companyId);

  if (conversationsQuery.isLoading || metricsQuery.isLoading) {
    return <LoadingState label="Carregando relatórios..." description="Consolidando pedidos, mensagens e indicadores da loja." />;
  }

  if (conversationsQuery.error || metricsQuery.error) {
    return (
      <ErrorState
        description="Não foi possível carregar os relatórios da loja."
        onRetry={() => {
          void conversationsQuery.refetch();
          void metricsQuery.refetch();
        }}
      />
    );
  }

  const conversations = conversationsQuery.data ?? [];
  const metrics = metricsQuery.data ?? [];

  const incomingMessages = metrics
    .filter((item) => item.metric_name.includes("incoming"))
    .reduce((acc, item) => acc + item.metric_value, 0);
  const handoffs = metrics
    .filter((item) => item.metric_name.includes("handoff"))
    .reduce((acc, item) => acc + item.metric_value, 0);
  const finishedOrders = conversations.filter((item) => item.status === "resolved").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Relatórios"
        title="Resultados da operação"
        description="Acompanhe volume de pedidos, mensagens e indicadores básicos da loja em um relatório simples e direto."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Pedidos no período" value={conversations.length} icon={ClipboardList} hint="Conversas tratadas como pedidos ativos" />
        <StatCard title="Pedidos finalizados" value={finishedOrders} icon={BarChart3} hint="Pedidos marcados como concluídos" />
        <StatCard title="Mensagens recebidas" value={formatCompactNumber(incomingMessages)} icon={MessageCircleMore} hint="Volume consolidado do período" />
        <StatCard title="Faturamento simples" value="Em breve" icon={CircleDollarSign} hint="Depende do módulo completo de pedidos" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Indicadores da loja</CardTitle>
          <CardDescription>Leitura rápida da movimentação registrada pela operação.</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.length ? (
            <DataTable
              rowKey={(item) => `${item.metric_name}-${item.metric_date}`}
              columns={[
                { key: "date", header: "Data", cell: (item) => formatDate(item.metric_date) },
                { key: "name", header: "Indicador", cell: (item) => item.metric_name },
                { key: "value", header: "Valor", cell: (item) => formatCompactNumber(item.metric_value) }
              ]}
              data={metrics}
            />
          ) : (
            <EmptyState
              title="Sem dados por enquanto"
              description="Os relatórios vão aparecer conforme sua loja receber mensagens e pedidos."
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atendimentos humanos</CardTitle>
          <CardDescription>Quando a IA passa para uma pessoa, esse volume aparece aqui.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{formatCompactNumber(handoffs)}</p>
          <p className="mt-2 text-sm text-muted-foreground">Quantidade de atendimentos assumidos manualmente pela equipe.</p>
        </CardContent>
      </Card>
    </div>
  );
}
