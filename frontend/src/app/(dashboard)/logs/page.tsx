"use client";

import { AlertTriangle, Bot, MessageSquareText, ShieldCheck } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { DevOnlyPage } from "@/components/shared/dev-only-page";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyScope } from "@/hooks/use-company-scope";
import { useCompany } from "@/hooks/use-company";
import { useMetrics } from "@/hooks/use-metrics";
import { useWhatsappInstances } from "@/hooks/use-whatsapp";
import { formatCompactNumber } from "@/lib/formatters";

export default function LogsPage() {
  const companyId = useCompanyScope();
  const companyQuery = useCompany(companyId);
  const metricsQuery = useMetrics(companyId);
  const whatsappQuery = useWhatsappInstances(companyId);

  return (
    <DevOnlyPage>
      {companyQuery.isLoading || metricsQuery.isLoading || whatsappQuery.isLoading ? (
        <LoadingState label="Carregando painel de suporte..." description="Buscando sinais operacionais da plataforma." />
      ) : companyQuery.error || metricsQuery.error || whatsappQuery.error ? (
        <ErrorState
          description="Não foi possível carregar o painel de suporte."
          onRetry={() => {
            void companyQuery.refetch();
            void metricsQuery.refetch();
            void whatsappQuery.refetch();
          }}
        />
      ) : (
        <LogsContent
          botPaused={Boolean(companyQuery.data?.bot_paused)}
          metrics={metricsQuery.data ?? []}
          instances={whatsappQuery.data ?? []}
        />
      )}
    </DevOnlyPage>
  );
}

function LogsContent({
  botPaused,
  metrics,
  instances
}: {
  botPaused: boolean;
  metrics: Array<{ metric_name: string; metric_value: number }>;
  instances: Array<{ id: number; name: string; instance_name: string; active: boolean }>;
}) {
  const totalMessages = metrics
    .filter((item) => item.metric_name.includes("messages"))
    .reduce((acc, item) => acc + item.metric_value, 0);
  const inactiveInstances = instances.filter((instance) => !instance.active);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Suporte operacional"
        title="Logs e sinais da plataforma"
        description="Use esta área para acompanhar disponibilidade, possíveis falhas e saúde geral da operação técnica."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Mensagens processadas" value={formatCompactNumber(totalMessages)} icon={MessageSquareText} />
        <StatCard title="Instâncias ativas" value={instances.filter((item) => item.active).length} icon={ShieldCheck} />
        <StatCard title="Instâncias com alerta" value={inactiveInstances.length} icon={AlertTriangle} />
        <StatCard title="Bot global" value={botPaused ? "Pausado" : "Ativo"} icon={Bot} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alertas recentes</CardTitle>
          <CardDescription>Indicadores úteis para suporte, monitoração e diagnóstico rápido.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-2xl border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">Status global do bot</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {botPaused
                    ? "A automação da empresa ativa está pausada e exige verificação."
                    : "A automação da empresa ativa está funcionando normalmente."}
                </p>
              </div>
              <Badge variant={botPaused ? "danger" : "success"}>{botPaused ? "Pausado" : "Normal"}</Badge>
            </div>
          </div>

          {inactiveInstances.length ? (
            inactiveInstances.map((instance) => (
              <div key={instance.id} className="rounded-2xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{instance.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Instância {instance.instance_name} precisa de revisão técnica.
                    </p>
                  </div>
                  <Badge variant="danger">Inativa</Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border p-4">
              <p className="font-medium">Nenhum alerta crítico no momento</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Canais, bot e sinais básicos da plataforma estão estáveis.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
