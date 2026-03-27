"use client";

import Link from "next/link";
import { LifeBuoy, Store, Users2 } from "lucide-react";
import { toast } from "sonner";

import { BusinessProfileForm } from "@/components/forms/business-profile-form";
import { CompanyForm } from "@/components/forms/company-form";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { DevOnlyPage } from "@/components/shared/dev-only-page";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { ResponsibilityGrid } from "@/components/shared/responsibility-grid";
import { SectionCard } from "@/components/shared/section-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBusinessMutations, useBusinessProfile } from "@/hooks/use-business";
import { useCompany, useUpdateCompany } from "@/hooks/use-company";
import { isDev } from "@/lib/auth/roles";
import { getErrorMessage } from "@/lib/errors";

export default function SettingsPage() {
  const { user } = useAuth();

  return isDev(user) ? <DevSettingsPage /> : <ClientSettingsPage />;
}

function ClientSettingsPage() {
  const profileQuery = useBusinessProfile();
  const mutations = useBusinessMutations();

  if (profileQuery.isLoading) {
    return <LoadingState label="Carregando configuracoes da loja..." description="Buscando dados do delivery e mensagens automaticas." />;
  }

  if (profileQuery.error || !profileQuery.data) {
    return (
      <ErrorState description="Nao foi possivel carregar as configuracoes da loja." onRetry={() => void profileQuery.refetch()} />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuracoes"
        title="Configuracoes da loja"
        description="Atualize os dados do negocio, mensagens automaticas e informacoes que a IA usa para responder com seguranca."
      />

      <ResponsibilityGrid
        title="O que voce deve manter atualizado"
        description="Esses dados deixam o atendimento automatico mais confiavel sem exigir configuracao tecnica."
        items={[
          {
            title: "Dados do negocio",
            description: "Informacoes basicas da empresa para atendimento e entrega.",
            bullets: ["Telefone", "Endereco", "Cidade e bairro", "Taxa de entrega e retirada"],
            href: "/business",
            actionLabel: "Abrir negocio",
            icon: <Store className="h-4 w-4" />,
            tone: "client"
          },
          {
            title: "Equipe e FAQ",
            description: "Itens que melhoram a rotina operacional e a qualidade das respostas.",
            bullets: ["Cadastrar atendentes", "Respostas frequentes", "Informacoes importantes da loja"],
            href: "/users",
            actionLabel: "Abrir equipe",
            icon: <Users2 className="h-4 w-4" />,
            tone: "client"
          }
        ]}
      />

      <SectionCard
        title="Dados da loja e mensagens"
        description="Essas informacoes alimentam o atendimento automatico e ajudam sua equipe a responder mais rapido."
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
              toast.success("Configuracoes da loja salvas");
            } catch (error) {
              toast.error(getErrorMessage(error, "Nao foi possivel salvar as configuracoes da loja."));
            }
          }}
        />
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Equipe da loja</CardTitle>
            <CardDescription>Cadastre atendentes para dividir o atendimento e a rotina da operacao.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/users">Abrir equipe</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FAQ e informacoes</CardTitle>
            <CardDescription>Guarde respostas frequentes, regras e observacoes importantes do negocio.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/knowledge">Abrir FAQ</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DevSettingsPage() {
  const companyQuery = useCompany();
  const updateMutation = useUpdateCompany();

  return (
    <DevOnlyPage>
      {companyQuery.isLoading ? (
        <LoadingState label="Carregando empresa..." description="Buscando parametros tecnicos e operacionais." />
      ) : companyQuery.error || !companyQuery.data ? (
        <ErrorState description="Nao foi possivel carregar os dados da empresa." onRetry={() => void companyQuery.refetch()} />
      ) : (
        <div className="space-y-6">
          <PageHeader
            eyebrow="Conta ativa"
            title="Configuracao tecnica da empresa"
            description="Ajuste o que e sensivel para a operacao da conta: tom do agente, prompt avancado, status e automacao."
          />

          <ResponsibilityGrid
            title="Separacao de responsabilidades"
            description="Mantenha o cliente fora das configuracoes sensiveis e deixe o painel da empresa focado no negocio."
            items={[
              {
                title: "Area reservada ao dev",
                description: "Tudo o que altera a arquitetura da conta ou a operacao tecnica da plataforma.",
                bullets: ["Prompt avancado", "Status da conta", "Bot pausado", "Billing, logs e canais"],
                icon: <LifeBuoy className="h-4 w-4" />,
                tone: "dev"
              },
              {
                title: "Area visivel ao cliente",
                description: "Informacoes operacionais que ajudam a IA sem expor detalhes tecnicos.",
                bullets: ["Negocio", "Equipe", "FAQ", "Cardapio, horarios e promocoes"],
                icon: <Store className="h-4 w-4" />,
                tone: "client"
              }
            ]}
          />

          <Card>
            <CardHeader>
              <CardTitle>Parametros avancados</CardTitle>
              <CardDescription>Essas configuracoes ficam visiveis apenas para o painel master.</CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyForm
                company={companyQuery.data}
                loading={updateMutation.isPending}
                onSubmit={async (values) => {
                  try {
                    await updateMutation.mutateAsync(values);
                    toast.success("Configuracao tecnica atualizada");
                  } catch (error) {
                    toast.error(getErrorMessage(error, "Nao foi possivel atualizar a configuracao tecnica."));
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </DevOnlyPage>
  );
}
