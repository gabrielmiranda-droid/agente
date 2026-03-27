"use client";

import { CreditCard, MapPin, Sparkles, Store } from "lucide-react";
import { toast } from "sonner";

import { BusinessProfileForm } from "@/components/forms/business-profile-form";
import { PageHeader } from "@/components/layout/page-header";
import { CompanyScopeSelect } from "@/components/shared/company-scope-select";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { ResponsibilityGrid } from "@/components/shared/responsibility-grid";
import { SectionCard } from "@/components/shared/section-card";
import { useBusinessMutations, useBusinessProfile } from "@/hooks/use-business";
import { useCompanyScope } from "@/hooks/use-company-scope";
import { getErrorMessage } from "@/lib/errors";

export default function BusinessPage() {
  const companyId = useCompanyScope();
  const profileQuery = useBusinessProfile(companyId);
  const mutations = useBusinessMutations(companyId);

  if (profileQuery.isLoading) {
    return <LoadingState label="Carregando informacoes do negocio..." description="Buscando os dados operacionais da empresa." />;
  }

  if (profileQuery.error || !profileQuery.data) {
    return (
      <ErrorState
        description="Nao foi possivel carregar as informacoes do negocio."
        onRetry={() => void profileQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Negocio"
        title="Informacoes do negocio"
        description="Preencha os dados que a IA precisa usar automaticamente no atendimento: localizacao, formas de pagamento, entrega e mensagens comerciais."
      />
      <CompanyScopeSelect />

      <ResponsibilityGrid
        title="O que a IA usa daqui"
        description="Esses campos substituem boa parte de um prompt manual grande e deixam a resposta mais precisa."
        items={[
          {
            title: "Apresentacao da loja",
            description: "Dados usados para responder quem voce e, onde atende e como funciona.",
            bullets: ["Nome da loja", "Telefone", "Endereco", "Cidade e bairro"],
            icon: <Store className="h-4 w-4" />,
            tone: "client"
          },
          {
            title: "Entrega e pagamento",
            description: "Informacoes usadas em perguntas de compra e fechamento de pedido.",
            bullets: ["Taxa de entrega", "Tempo estimado", "Retirada no local", "Formas de pagamento"],
            icon: <CreditCard className="h-4 w-4" />,
            tone: "client"
          },
          {
            title: "Mensagens automaticas",
            description: "Textos usados na abertura do atendimento e fora do horario.",
            bullets: ["Mensagem de boas-vindas", "Mensagem fora do horario", "Tom coerente com a loja"],
            icon: <Sparkles className="h-4 w-4" />,
            tone: "client"
          }
        ]}
        columns={3}
      />

      <SectionCard
        title="Dados comerciais e operacionais"
        description="Esses dados ajudam a empresa a manter respostas coerentes sem depender de um prompt tecnico gigante."
      >
        <BusinessProfileForm
          profile={profileQuery.data}
          loading={mutations.updateBusinessProfileMutation.isPending}
          onSubmit={async (values) => {
            try {
              await mutations.updateBusinessProfileMutation.mutateAsync({
                ...values,
                phone: values.phone || null,
                address: values.address || null,
                city: values.city || null,
                neighborhood: values.neighborhood || null,
                delivery_fee: values.delivery_fee ?? null,
                estimated_delivery_time: values.estimated_delivery_time || null,
                payment_methods: values.payment_methods_text
                  ? values.payment_methods_text.split(",").map((item) => item.trim()).filter(Boolean)
                  : [],
                welcome_message: values.welcome_message || null,
                out_of_hours_message: values.out_of_hours_message || null
              });
              toast.success("Informacoes do negocio salvas");
            } catch (error) {
              toast.error(getErrorMessage(error, "Nao foi possivel salvar os dados do negocio."));
            }
          }}
        />
      </SectionCard>

      <ResponsibilityGrid
        title="Checklist rapido"
        description="Uma empresa real consegue operar melhor quando esses pontos estao preenchidos."
        items={[
          {
            title: "Endereco e atendimento",
            description: "Evita respostas incompletas nas primeiras perguntas do cliente.",
            bullets: ["Bairro", "Cidade", "Telefone atualizado"],
            icon: <MapPin className="h-4 w-4" />,
            tone: "neutral"
          },
          {
            title: "Entrega e retirada",
            description: "Ajuda a IA a conduzir o pedido sem improvisar.",
            bullets: ["Taxa de entrega", "Tempo medio", "Aceita retirada"],
            icon: <CreditCard className="h-4 w-4" />,
            tone: "neutral"
          }
        ]}
      />
    </div>
  );
}
