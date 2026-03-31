"use client";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyScope } from "@/hooks/use-company-scope";
import { useFinanceSummary } from "@/hooks/use-operations";
import { formatCurrencyBrl, formatDate } from "@/lib/formatters";

export default function FinancePage() {
  const companyId = useCompanyScope();
  const financeQuery = useFinanceSummary(companyId);

  if (financeQuery.isLoading) {
    return <LoadingState label="Carregando financeiro..." description="Consolidando vendas, ticket medio e mix de pagamento." />;
  }

  if (financeQuery.error || !financeQuery.data) {
    return <ErrorState description="Nao foi possivel carregar o financeiro." onRetry={() => void financeQuery.refetch()} />;
  }

  const finance = financeQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Financeiro"
        title="Indicadores de venda"
        description="Painel operacional com total vendido, ticket medio, pedidos do periodo, formas de pagamento e produtos mais vendidos."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Periodo" value={`${formatDate(finance.period_start)} a ${formatDate(finance.period_end)}`} />
        <MetricCard title="Total vendido" value={formatCurrencyBrl(finance.total_sold)} />
        <MetricCard title="Ticket medio" value={formatCurrencyBrl(finance.average_ticket)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-white/8 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-base text-white">Formas de pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(finance.payment_breakdown).length ? (
              Object.entries(finance.payment_breakdown).map(([method, value]) => (
                <div key={method} className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 p-4 text-sm">
                  <span className="text-slate-300">{method}</span>
                  <strong className="text-white">{formatCurrencyBrl(value)}</strong>
                </div>
              ))
            ) : (
              <EmptyState title="Sem fechamento" description="As formas de pagamento aparecem conforme os pedidos forem gravados." />
            )}
          </CardContent>
        </Card>

        <Card className="border-white/8 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-base text-white">Produtos mais vendidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {finance.top_products.length ? (
              finance.top_products.map((product) => (
                <div key={product.name} className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 p-4 text-sm">
                  <span className="text-slate-300">{product.name}</span>
                  <strong className="text-white">{product.quantity}</strong>
                </div>
              ))
            ) : (
              <EmptyState title="Sem ranking" description="O ranking aparece quando os itens de pedidos forem registrados." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="border-white/8 bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="text-base text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-white">{value}</p>
      </CardContent>
    </Card>
  );
}
