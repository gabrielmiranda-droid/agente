"use client";

import Link from "next/link";
import {
  Bot,
  Building2,
  CircleAlert,
  MessageSquareText,
  Radio,
  ScrollText,
  Smartphone,
  Store,
  Users2,
  Zap
} from "lucide-react";

import { AlertList, type DashboardAlert } from "@/components/dashboard/alert-list";
import { QuickActions, type QuickActionItem } from "@/components/dashboard/quick-actions";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { ResponsibilityGrid } from "@/components/shared/responsibility-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyScope } from "@/hooks/use-company-scope";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { isDev } from "@/lib/auth/roles";
import { formatCompactNumber, formatCurrencyUsd, formatDateTime, formatPhoneNumber, getContactDisplayName } from "@/lib/formatters";

function DevDashboard({
  companies,
  conversations,
  instances,
  agents,
  metricCount,
  cards
}: {
  companies: NonNullable<ReturnType<typeof useDashboardData>["companiesQuery"]["data"]>;
  conversations: NonNullable<ReturnType<typeof useDashboardData>["conversationsQuery"]["data"]>;
  instances: NonNullable<ReturnType<typeof useDashboardData>["instancesQuery"]["data"]>;
  agents: NonNullable<ReturnType<typeof useDashboardData>["agentsQuery"]["data"]>;
  metricCount: number;
  cards: ReturnType<typeof useDashboardData>["cards"];
}) {
  const disconnectedInstances = instances.filter((item) => !item.active);
  const inactiveCompanies = companies.filter((item) => item.status !== "active");
  const inactiveAgents = agents.filter((item) => !item.active);

  const alerts: DashboardAlert[] = [];
  if (disconnectedInstances.length) {
    alerts.push({
      title: "Instancias desconectadas",
      description: `${disconnectedInstances.length} instancia(s) de WhatsApp exigem verificacao imediata.`,
      severity: "critical"
    });
  }
  if (inactiveCompanies.length) {
    alerts.push({
      title: "Empresas fora do estado ativo",
      description: `${inactiveCompanies.length} empresa(s) estao com status diferente de ativo.`,
      severity: "warning"
    });
  }
  if (inactiveAgents.length) {
    alerts.push({
      title: "Agentes inativos",
      description: `${inactiveAgents.length} agente(s) precisam de revisao ou reativacao.`,
      severity: "warning"
    });
  }
  if (!instances.length) {
    alerts.push({
      title: "Nenhum canal conectado",
      description: "Ainda nao ha instancias de WhatsApp configuradas.",
      severity: "critical"
    });
  }

  const quickActions: QuickActionItem[] = [
    { title: "Criar empresa", description: "Abrir cadastro de uma nova conta", href: "/companies" },
    { title: "Conectar WhatsApp", description: "Revisar canais e instancias", href: "/whatsapp" },
    { title: "Criar agente", description: "Cadastrar ou revisar agentes", href: "/agents" },
    { title: "Ver logs", description: "Inspecionar falhas e eventos", href: "/logs" }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Painel dev"
        title="Cockpit operacional"
        description="Status critico, volume, suporte e implantacao das empresas em uma unica visao."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Instancias WhatsApp" value={`${cards.activeInstances}/${instances.length || 0}`} icon={Smartphone} hint="Ativas sobre total configurado" />
        <StatCard title="Empresas ativas" value={cards.activeCompanies} icon={Building2} hint="Contas em operacao" />
        <StatCard title="Erros recentes" value={alerts.length} icon={CircleAlert} hint="Alertas operacionais identificados" />
        <StatCard title="Fila de mensagens" value={cards.openConversations} icon={Radio} hint="Conversas abertas aguardando fluxo" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Mensagens do dia" value={formatCompactNumber(cards.incoming)} icon={MessageSquareText} hint="Entradas registradas" />
        <StatCard title="Conversas ativas" value={cards.openConversations} icon={Zap} hint="Threads em andamento" />
        <StatCard title="Uso da API" value={formatCompactNumber(cards.apiUsage)} icon={Radio} hint="Chamadas estimadas por trafego" />
        <StatCard title="Uso da OpenAI" value={formatCurrencyUsd(cards.openAiUsageCost)} icon={Bot} hint="Custo estimado acumulado" />
      </div>

      <QuickActions actions={quickActions} />

      <ResponsibilityGrid
        title="Modelo de operacao do SaaS"
        description="Separacao clara entre o que fica no painel master e o que o cliente precisa manter atualizado."
        items={[
          {
            title: "Controle master",
            description: "Camada reservada ao dev para governar contas, risco e suporte.",
            bullets: ["Empresas e status", "Canais WhatsApp", "Agentes, billing e logs", "Metricas globais e suporte"],
            href: "/companies",
            actionLabel: "Abrir empresas",
            icon: <Building2 className="h-4 w-4" />,
            tone: "dev"
          },
          {
            title: "Operacao do cliente",
            description: "Dados que a empresa alimenta no proprio painel para a IA responder melhor.",
            bullets: ["Negocio e entrega", "Equipe e FAQ", "Cardapio, horarios e promocoes", "Conversas e operacao"],
            href: "/business",
            actionLabel: "Abrir empresa em foco",
            icon: <Store className="h-4 w-4" />,
            tone: "client"
          }
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <AlertList alerts={alerts} />

        <Card className="border-white/8 bg-white/[0.03]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base text-white">Atividade recente</CardTitle>
            <Button asChild variant="outline" className="border-white/10 bg-transparent text-white hover:bg-white/[0.06]">
              <Link href="/metrics">Ver metricas</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {conversations.length ? (
              conversations.slice(0, 6).map((conversation) => (
                <div key={conversation.id} className="rounded-xl border border-white/8 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {getContactDisplayName(conversation.contact_name, conversation.contact_phone_number)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{formatPhoneNumber(conversation.contact_phone_number)}</p>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {conversation.last_message_preview ?? "Sem preview da ultima mensagem."}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge variant="neutral">{conversation.status}</Badge>
                      <p className="mt-2 text-xs text-slate-500">{formatDateTime(conversation.updated_at)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="Sem atividade recente" description="As ultimas conversas da plataforma aparecerao aqui." />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-white/8 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-base text-white">Instancias com problema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {disconnectedInstances.length ? (
              disconnectedInstances.map((instance) => (
                <div key={instance.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 p-4">
                  <div>
                    <p className="text-sm font-medium text-white">{instance.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{instance.instance_name}</p>
                  </div>
                  <Badge variant="danger">Desconectada</Badge>
                </div>
              ))
            ) : (
              <EmptyState title="Sem instancias com falha" description="Nenhum canal desconectado foi encontrado." />
            )}
          </CardContent>
        </Card>

        <Card className="border-white/8 bg-white/[0.03]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base text-white">Agentes e empresas</CardTitle>
            <Button asChild variant="outline" className="border-white/10 bg-transparent text-white hover:bg-white/[0.06]">
              <Link href="/agents">Abrir agentes</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 p-4">
              <div>
                <p className="text-sm font-medium text-white">Agentes ativos</p>
                <p className="mt-1 text-sm text-slate-500">Modelos disponiveis para atendimento e automacao</p>
              </div>
              <span className="text-sm font-semibold text-white">{cards.activeAgents}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 p-4">
              <div>
                <p className="text-sm font-medium text-white">Empresas cadastradas</p>
                <p className="mt-1 text-sm text-slate-500">Contas provisionadas na plataforma</p>
              </div>
              <span className="text-sm font-semibold text-white">{companies.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 p-4">
              <div>
                <p className="text-sm font-medium text-white">Metricas carregadas</p>
                <p className="mt-1 text-sm text-slate-500">Itens retornados pela API de metricas</p>
              </div>
              <span className="text-sm font-semibold text-white">{metricCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AttendantDashboard({
  company,
  conversations,
  instances,
  cards
}: {
  company: ReturnType<typeof useDashboardData>["companyQuery"]["data"];
  conversations: NonNullable<ReturnType<typeof useDashboardData>["conversationsQuery"]["data"]>;
  instances: NonNullable<ReturnType<typeof useDashboardData>["instancesQuery"]["data"]>;
  cards: ReturnType<typeof useDashboardData>["cards"];
}) {
  const activeInstances = instances.filter((item) => item.active).length;
  const botActive = company ? !company.bot_paused : true;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Operacao" title={company?.name ?? "Sua loja"} description="Resumo do atendimento e da operacao da empresa." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Pedidos do dia" value={conversations.length} icon={MessageSquareText} hint="Conversas recebidas" />
        <StatCard title="Conversas abertas" value={cards.openConversations} icon={Radio} hint="Atendimentos em andamento" />
        <StatCard title="Mensagens" value={formatCompactNumber(cards.incoming)} icon={Zap} hint="Volume de entrada" />
        <StatCard title="Bot" value={botActive ? "Ativo" : "Pausado"} icon={Bot} hint="Status da automacao" />
        <StatCard title="WhatsApp" value={activeInstances > 0 ? "Conectado" : "Offline"} icon={Smartphone} hint="Estado do canal" />
      </div>

      <ResponsibilityGrid
        title="O que manter atualizado"
        description="Esses modulos sustentam o atendimento automatico e a operacao diaria da sua empresa."
        items={[
          {
            title: "Cadastro da loja",
            description: "Dados que ajudam o atendimento a responder sem depender de configuracao tecnica.",
            bullets: ["Negocio", "Entrega", "Horarios", "Promocoes"],
            href: "/business",
            actionLabel: "Abrir cadastro da loja",
            icon: <Store className="h-4 w-4" />,
            tone: "client"
          },
          {
            title: "Equipe e FAQ",
            description: "Informacoes que apoiam o atendimento humano e melhoram a IA.",
            bullets: ["Usuarios da empresa", "Perguntas frequentes", "Informacoes importantes"],
            href: "/users",
            actionLabel: "Abrir operacao",
            icon: <Users2 className="h-4 w-4" />,
            tone: "client"
          }
        ]}
      />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const devMode = isDev(user);
  const companyId = useCompanyScope();
  const { companyQuery, companiesQuery, conversationsQuery, metricsQuery, instancesQuery, agentsQuery, cards } =
    useDashboardData(companyId);

  const loading =
    companyQuery.isLoading ||
    conversationsQuery.isLoading ||
    metricsQuery.isLoading ||
    instancesQuery.isLoading ||
    (devMode && (companiesQuery.isLoading || agentsQuery.isLoading));

  if (loading) {
    return <LoadingState label="Carregando painel..." description="Preparando dados do dashboard." />;
  }

  const hasError =
    companyQuery.error ||
    conversationsQuery.error ||
    metricsQuery.error ||
    instancesQuery.error ||
    (devMode && (companiesQuery.error || agentsQuery.error));

  if (hasError) {
    return (
      <ErrorState
        description="Nao foi possivel carregar o dashboard agora."
        onRetry={() => {
          void companyQuery.refetch();
          void conversationsQuery.refetch();
          void metricsQuery.refetch();
          void instancesQuery.refetch();
          if (devMode) {
            void companiesQuery.refetch();
            void agentsQuery.refetch();
          }
        }}
      />
    );
  }

  const company = companyQuery.data;
  const companies = companiesQuery.data ?? [];
  const conversations = conversationsQuery.data ?? [];
  const instances = instancesQuery.data ?? [];
  const agents = agentsQuery.data ?? [];
  const metricCount = metricsQuery.data?.length ?? 0;

  return devMode ? (
    <DevDashboard
      companies={companies}
      conversations={conversations}
      instances={instances}
      agents={agents}
      metricCount={metricCount}
      cards={cards}
    />
  ) : (
    <AttendantDashboard company={company} conversations={conversations} instances={instances} cards={cards} />
  );
}
