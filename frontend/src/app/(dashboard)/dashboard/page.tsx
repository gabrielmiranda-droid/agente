"use client";

import Link from "next/link";
import { Bot, Building2, MessageSquareText, Package, Phone, ShoppingBag, Users2, WalletCards, Waypoints } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyScope } from "@/hooks/use-company-scope";
import { useClientPanel, useDevPanel } from "@/hooks/use-operations";
import { isDev } from "@/lib/auth/roles";
import { formatCurrencyBrl, formatPhoneNumber } from "@/lib/formatters";

const clientIcons = [ShoppingBag, Waypoints, ShoppingBag, WalletCards, WalletCards, MessageSquareText, Phone, Bot];
const devIcons = [Building2, Users2, MessageSquareText, Bot];

function formatStatValue(label: string, value: string | number) {
  if (typeof value === "number" && /faturamento|custo/i.test(label)) {
    return formatCurrencyBrl(value);
  }
  return String(value);
}

function ClientDashboard({ companyId }: { companyId?: number }) {
  const panelQuery = useClientPanel(companyId);

  if (panelQuery.isLoading) {
    return <LoadingState label="Carregando operacao..." description="Consolidando pedidos, WhatsApp e financeiro." />;
  }

  if (panelQuery.error || !panelQuery.data) {
    return <ErrorState description="Nao foi possivel carregar o painel do cliente." onRetry={() => void panelQuery.refetch()} />;
  }

  const panel = panelQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Painel do cliente"
        title="Operacao de delivery"
        description="Visao direta da loja para pedidos, atendimento no WhatsApp, cardapio, estoque e faturamento."
      />

      <section className="overflow-hidden rounded-[2rem] border border-primary/10 bg-gradient-to-r from-primary/12 via-amber-300/5 to-emerald-400/5 p-6">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Cockpit operacional</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Pedidos, WhatsApp e financeiro no mesmo painel.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              O painel do cliente continua simples e direto: acompanhar pedidos, alimentar a IA com dados do negocio e agir rapido na rotina da loja.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Inbox</p>
              <p className="mt-2 text-2xl font-semibold text-white">{panel.inbox_counts.open ?? 0}</p>
              <p className="mt-1 text-sm text-slate-500">conversas aguardando acao</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Financeiro</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrencyBrl(panel.finance_summary.total_sold)}</p>
              <p className="mt-1 text-sm text-slate-500">vendas consolidadas</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Catalogo</p>
              <p className="mt-2 text-2xl font-semibold text-white">{panel.catalog_summary.products ?? 0}</p>
              <p className="mt-1 text-sm text-slate-500">produtos prontos para venda</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {panel.stats.map((stat, index) => {
          const Icon = clientIcons[index] ?? ShoppingBag;
          return <StatCard key={stat.label} title={stat.label} value={formatStatValue(stat.label, stat.value)} icon={Icon} hint={stat.hint} />;
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/8 bg-white/[0.03]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base text-white">Pedidos recentes</CardTitle>
            <Button asChild variant="outline" className="border-white/10 bg-transparent text-white hover:bg-white/[0.06]">
              <Link href="/orders">Abrir pedidos</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {panel.orders.length ? (
              panel.orders.slice(0, 6).map((order) => (
                <div key={order.id} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{order.code}</p>
                      <p className="mt-1 text-sm text-slate-400">{order.customer_name ?? "Cliente nao identificado"}</p>
                      <p className="mt-2 text-sm text-slate-500">
                        {order.items.length} item(ns) • {order.fulfillment_type} • {formatCurrencyBrl(order.total_amount)}
                      </p>
                    </div>
                    <Badge variant="neutral">{order.status}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="Sem pedidos estruturados" description="Os pedidos vao aparecer aqui assim que forem gravados como entidades proprias." />
            )}
          </CardContent>
        </Card>

        <Card className="border-white/8 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-base text-white">Como a IA usa os dados da loja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {panel.ai_context_sources.map((source) => (
              <div key={source.source} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{source.source}</p>
                  <Badge variant="neutral">{source.items}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{source.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-white/8 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-base text-white">Catalogo operacional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 p-4">
              <span>Categorias</span>
              <strong>{panel.catalog_summary.categories ?? 0}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 p-4">
              <span>Produtos</span>
              <strong>{panel.catalog_summary.products ?? 0}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 p-4">
              <span>Adicionais</span>
              <strong>{panel.catalog_summary.addons ?? 0}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 p-4">
              <span>Promocoes ativas</span>
              <strong>{panel.catalog_summary.promotions ?? 0}</strong>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/8 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-base text-white">Estoque baixo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {panel.inventory_alerts.length ? (
              panel.inventory_alerts.map((item) => (
                <div key={String(item.id)} className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <p className="text-sm font-semibold text-white">{String(item.name)}</p>
                  <p className="mt-1 text-sm text-slate-300">
                    Atual: {String(item.current_quantity)} • Minimo: {String(item.threshold)}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState title="Sem alertas" description="Nenhum item abaixo do nivel minimo foi identificado." />
            )}
          </CardContent>
        </Card>

        <Card className="border-white/8 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-base text-white">Negocio e atendimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">{String(panel.business_snapshot.business_name ?? "Empresa")}</p>
              <p className="mt-2 text-slate-400">{formatPhoneNumber(panel.business_snapshot.phone as string | null | undefined)}</p>
              <p className="mt-2 text-slate-400">{String(panel.business_snapshot.address ?? "Endereco nao informado")}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <p className="font-medium text-white">Mensagem de boas-vindas</p>
              <p className="mt-2 leading-6 text-slate-400">{String(panel.business_snapshot.welcome_message ?? "Nao configurada")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DevDashboard() {
  const panelQuery = useDevPanel();

  if (panelQuery.isLoading) {
    return <LoadingState label="Carregando painel dev..." description="Buscando empresas, acessos, canais e consumo de IA." />;
  }

  if (panelQuery.error || !panelQuery.data) {
    return <ErrorState description="Nao foi possivel carregar o painel dev." onRetry={() => void panelQuery.refetch()} />;
  }

  const panel = panelQuery.data;
  const keyStats = panel.global_stats.slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Painel dev"
        title="Controle do SaaS"
        description="Painel dev reavaliado para ficar mais enxuto: empresas, acessos, WhatsApp, IA e billing como foco principal."
      />

      <section className="overflow-hidden rounded-[2rem] border border-primary/10 bg-gradient-to-r from-white/[0.04] to-primary/10 p-6">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Painel dev simplificado</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Menos ruido tecnico, mais controle operacional do SaaS.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              A prioridade agora fica em acompanhar empresas, liberar acesso, validar canais, medir uso de IA e manter billing sob controle. Itens secundarios saem do foco do menu principal.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Empresas</p>
              <p className="mt-2 text-2xl font-semibold text-white">{panel.company_breakdown.length}</p>
              <p className="mt-1 text-sm text-slate-500">contas ativas na base</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">IA</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrencyBrl(panel.ai_usage.estimated_cost)}</p>
              <p className="mt-1 text-sm text-slate-500">custo acumulado de operacao</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {keyStats.map((stat, index) => {
          const Icon = devIcons[index] ?? Building2;
          return <StatCard key={stat.label} title={stat.label} value={formatStatValue(stat.label, stat.value)} icon={Icon} hint={stat.hint} />;
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/8 bg-white/[0.03]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base text-white">Empresas e status</CardTitle>
            <Button asChild variant="outline" className="border-white/10 bg-transparent text-white hover:bg-white/[0.06]">
              <Link href="/companies">Abrir empresas</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {panel.company_breakdown.length ? (
              panel.company_breakdown.map((company) => (
                <div key={String(company.company_id)} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{String(company.name)}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {String(company.connected_instances)}/{String(company.total_instances)} canal(is) conectados • {String(company.active_agents)} agente(s)
                      </p>
                    </div>
                    <Badge variant={company.status === "active" ? "success" : "warning"}>{String(company.status)}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="Sem empresas" description="As contas cadastradas do SaaS aparecerao aqui." />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/8 bg-white/[0.03]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base text-white">Acesso rapido</CardTitle>
              <Button asChild variant="outline" className="border-white/10 bg-transparent text-white hover:bg-white/[0.06]">
                <Link href="/users">Abrir acessos</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-slate-300">
                <p className="font-medium text-white">Painel dev reorganizado</p>
                <p className="mt-2 leading-6 text-slate-400">
                  Empresas, acessos, canais, IA e billing continuam no centro. Itens como logs e configuracoes saem do menu principal para nao poluir a operacao administrativa.
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <p className="text-sm font-medium text-white">Modelos em uso</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(panel.ai_usage.models).map(([model, count]) => (
                    <Badge key={model} variant="neutral">
                      {model}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <p className="text-sm font-medium text-white">Distribuicao de planos</p>
                <div className="mt-3 space-y-2">
                  {panel.plan_breakdown.map((plan) => (
                    <div key={plan.plan} className="flex items-center justify-between text-sm text-slate-300">
                      <span>{plan.plan}</span>
                      <strong className="text-white">{plan.companies}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const companyId = useCompanyScope();

  return isDev(user) ? <DevDashboard /> : <ClientDashboard companyId={companyId} />;
}
