"use client";

import { Crown, Layers3 } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { DevOnlyPage } from "@/components/shared/dev-only-page";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { usePlans, useSubscription } from "@/hooks/use-billing";

export default function BillingPage() {
  const plansQuery = usePlans();
  const subscriptionQuery = useSubscription();

  return (
    <DevOnlyPage>
      {plansQuery.isLoading || subscriptionQuery.isLoading ? (
        <LoadingState label="Carregando billing..." description="Montando visão de planos, assinatura e limites da conta." />
      ) : plansQuery.error || subscriptionQuery.error ? (
        <ErrorState
          description="Não foi possível carregar o billing agora."
          onRetry={() => {
            void plansQuery.refetch();
            void subscriptionQuery.refetch();
          }}
        />
      ) : (
        <BillingContent plans={plansQuery.data ?? []} subscription={subscriptionQuery.data} />
      )}
    </DevOnlyPage>
  );
}

function BillingContent({
  plans,
  subscription
}: {
  plans: Array<{ id: number; name: string; max_messages_per_month: number; max_users: number; max_whatsapp_instances: number; max_ai_tokens_per_month: number }>;
  subscription: { plan_id: number; status: string } | null | undefined;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Planos e monetização"
        description="Acompanhe o plano atual, o status da assinatura e os limites preparados para cobrança comercial."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="Plano atual" value={subscription?.plan_id ?? "—"} icon={Crown} />
        <StatCard title="Status da assinatura" value={subscription?.status ?? "Sem assinatura"} icon={Layers3} />
      </div>

      {plans.length ? (
        <DataTable
          rowKey={(item) => item.id}
          columns={[
            { key: "name", header: "Plano", cell: (item) => <span className="font-medium">{item.name}</span> },
            { key: "messages", header: "Mensagens/mês", cell: (item) => item.max_messages_per_month },
            { key: "users", header: "Usuários", cell: (item) => item.max_users },
            { key: "instances", header: "Instâncias", cell: (item) => item.max_whatsapp_instances },
            { key: "tokens", header: "Tokens IA", cell: (item) => item.max_ai_tokens_per_month }
          ]}
          data={plans}
        />
      ) : (
        <EmptyState title="Sem planos disponíveis" description="Cadastre planos no backend para exibi-los aqui." />
      )}
    </div>
  );
}
