"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Building2, Plus, Store, Trash2, Users2, WalletCards, Wrench } from "lucide-react";
import { toast } from "sonner";

import { CompanyCreateForm, CompanyForm } from "@/components/forms/company-form";
import { PageHeader } from "@/components/layout/page-header";
import { CompanyAccessCard } from "@/components/shared/company-access-card";
import { DevOnlyPage } from "@/components/shared/dev-only-page";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { ResponsibilityGrid } from "@/components/shared/responsibility-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanies, useCreateCompany, useDeleteCompany, useUpdateCompanyById } from "@/hooks/use-company";
import { getErrorMessage } from "@/lib/errors";

export default function CompaniesPage() {
  const companiesQuery = useCompanies();
  const createMutation = useCreateCompany();
  const deleteMutation = useDeleteCompany();
  const updateMutation = useUpdateCompanyById();
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  const companies = companiesQuery.data ?? [];

  useEffect(() => {
    if (!companies.length) {
      setSelectedCompanyId(null);
      return;
    }
    if (!selectedCompanyId || !companies.some((item) => item.id === selectedCompanyId)) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  const selectedCompany = useMemo(
    () => companies.find((item) => item.id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId]
  );

  return (
    <DevOnlyPage>
      {companiesQuery.isLoading ? (
        <LoadingState label="Carregando empresas..." description="Buscando contas cadastradas na plataforma." />
      ) : companiesQuery.error ? (
        <ErrorState description="Nao foi possivel carregar as empresas." onRetry={() => void companiesQuery.refetch()} />
      ) : (
        <div className="space-y-6">
          <PageHeader
            eyebrow="Empresas"
            title="Administracao SaaS"
            description="Crie novas contas, acompanhe status das empresas e centralize a implantacao do cliente sem sair do painel master."
            actions={
              <Button variant="outline" className="border-white/10 bg-transparent text-white hover:bg-white/[0.06]">
                <Plus className="h-4 w-4" />
                Nova empresa
              </Button>
            }
          />

          <ResponsibilityGrid
            title="Modelo de operacao"
            description="Use essa separacao para manter o SaaS seguro e facil de operar para voce e para o cliente."
            items={[
              {
                title: "O que voce controla",
                description: "Area master do SaaS para implantacao, suporte e administracao das contas.",
                bullets: [
                  "Criar e pausar empresas",
                  "Conectar canais e instancias",
                  "Ajustar agente, prompt avancado e billing",
                  "Acompanhar logs, metricas e suporte"
                ],
                icon: <Wrench className="h-4 w-4" />,
                tone: "dev"
              },
              {
                title: "O que o cliente alimenta",
                description: "Rotina operacional da propria empresa, sem acesso tecnico.",
                bullets: [
                  "Dados do negocio e mensagens",
                  "Equipe, FAQ, horarios e promocoes",
                  "Cardapio, produtos, adicionais e precos",
                  "Conversas, atendimento e operacao do dia"
                ],
                icon: <Store className="h-4 w-4" />,
                tone: "client"
              }
            ]}
          />

          <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
            <div className="space-y-6">
              <Card className="border-white/8 bg-white/[0.03]">
                <CardHeader>
                  <CardTitle className="text-base text-white">Criar empresa</CardTitle>
                  <CardDescription className="text-slate-500">
                    Cadastro rapido de uma nova conta com acesso inicial do cliente.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CompanyCreateForm
                    loading={createMutation.isPending}
                    onSubmit={async (values) => {
                      try {
                        const company = await createMutation.mutateAsync(values);
                        toast.success("Empresa criada com sucesso");
                        setSelectedCompanyId(company.id);
                      } catch (error) {
                        toast.error(getErrorMessage(error, "Nao foi possivel criar a empresa."));
                      }
                    }}
                  />
                </CardContent>
              </Card>

              <CompanyAccessCard />

              <Card className="border-white/8 bg-white/[0.03]">
                <CardHeader>
                  <CardTitle className="text-base text-white">Empresas cadastradas</CardTitle>
                  <CardDescription className="text-slate-500">
                    Selecione uma conta para editar status, automacao e configuracoes administrativas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {companies.length ? (
                    companies.map((company) => (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => setSelectedCompanyId(company.id)}
                        className={`w-full rounded-xl border p-4 text-left transition ${
                          selectedCompanyId === company.id
                            ? "border-primary/40 bg-primary/[0.08]"
                            : "border-white/8 bg-black/20 hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">{company.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{company.slug}</p>
                          </div>
                          <Badge variant={company.status === "active" ? "success" : company.status === "paused" ? "warning" : "danger"}>
                            {company.status}
                          </Badge>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                          <Building2 className="h-3.5 w-3.5" />
                          ID {company.id}
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                            onClick={async (event) => {
                              event.stopPropagation();
                              const confirmed = window.confirm(`Excluir a empresa ${company.name}? Esta acao apaga os dados vinculados.`);
                              if (!confirmed) return;
                              try {
                                await deleteMutation.mutateAsync(company.id);
                                toast.success("Empresa excluida");
                                if (selectedCompanyId === company.id) {
                                  setSelectedCompanyId(null);
                                }
                              } catch (error) {
                                toast.error(getErrorMessage(error, "Nao foi possivel excluir a empresa."));
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </button>
                    ))
                  ) : (
                    <EmptyState title="Nenhuma empresa cadastrada" description="Crie a primeira empresa para iniciar o modelo SaaS." />
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-white/8 bg-white/[0.03]">
                <CardHeader>
                  <CardTitle className="text-base text-white">
                    {selectedCompany ? `Administrar ${selectedCompany.name}` : "Selecione uma empresa"}
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    {selectedCompany
                      ? "Ajuste status, prompt global, tom do agente e pausas operacionais da conta."
                      : "Escolha uma empresa na lista para administrar a conta."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedCompany ? (
                    <CompanyForm
                      company={selectedCompany}
                      loading={updateMutation.isPending}
                      onSubmit={async (values) => {
                        try {
                          await updateMutation.mutateAsync({ companyId: selectedCompany.id, payload: values });
                          toast.success("Empresa atualizada");
                        } catch (error) {
                          toast.error(getErrorMessage(error, "Nao foi possivel atualizar a empresa."));
                        }
                      }}
                    />
                  ) : (
                    <EmptyState
                      title="Nenhuma empresa selecionada"
                      description="Selecione uma conta na lista para editar suas configuracoes administrativas."
                    />
                  )}
                </CardContent>
              </Card>

              {selectedCompany ? (
                <>
                  <ResponsibilityGrid
                    title="Painel por empresa"
                    description="Estes modulos representam o que o cliente realmente alimenta no dia a dia."
                    items={[
                      {
                        title: "Negocio",
                        description: "Dados da empresa, entrega, mensagens e meios de pagamento.",
                        bullets: ["Telefone e endereco", "Entrega e retirada", "Mensagem de boas-vindas"],
                        href: `/business?companyId=${selectedCompany.id}`,
                        actionLabel: "Abrir negocio",
                        icon: <Store className="h-4 w-4" />,
                        tone: "client"
                      },
                      {
                        title: "Equipe e FAQ",
                        description: "Quem atende e quais respostas ajudam a IA no dia a dia.",
                        bullets: ["Usuarios da empresa", "Perguntas frequentes", "Regras operacionais"],
                        href: `/users?companyId=${selectedCompany.id}`,
                        actionLabel: "Abrir operacao",
                        icon: <Users2 className="h-4 w-4" />,
                        tone: "client"
                      },
                      {
                        title: "Cardapio e horarios",
                        description: "Produtos, precos, disponibilidade e funcionamento.",
                        bullets: ["Categorias e produtos", "Promocoes", "Horario de atendimento"],
                        href: `/menu?companyId=${selectedCompany.id}`,
                        actionLabel: "Abrir cadastro da loja",
                        icon: <Store className="h-4 w-4" />,
                        tone: "client"
                      },
                      {
                        title: "Cobranca e suporte",
                        description: "Itens que continuam sob sua responsabilidade no painel dev.",
                        bullets: ["Billing", "Canais WhatsApp", "Logs e metricas"],
                        href: "/billing",
                        actionLabel: "Abrir area tecnica",
                        icon: <WalletCards className="h-4 w-4" />,
                        tone: "dev"
                      }
                    ]}
                  />

                  <Card className="border-white/8 bg-white/[0.03]">
                    <CardHeader>
                      <CardTitle className="text-base text-white">Fluxo recomendado</CardTitle>
                      <CardDescription className="text-slate-500">
                        Caminho mais rapido para implantar uma empresa nova sem deixar lacunas.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        "1. Criar empresa e validar o login inicial do cliente.",
                        "2. Conectar a instancia de WhatsApp e revisar o bot.",
                        "3. Pedir que o cliente preencha negocio, cardapio, horarios e FAQ.",
                        "4. Monitorar logs, metricas e primeiras conversas da conta."
                      ].map((step) => (
                        <div key={step} className="rounded-xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-slate-400">
                          {step}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </DevOnlyPage>
  );
}
