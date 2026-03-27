"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useBusinessMutations, useBusinessProfile } from "@/hooks/use-business";
import { formatCurrencyBrl } from "@/lib/formatters";
import { getErrorMessage } from "@/lib/errors";

type DeliveryFormValues = {
  delivery_fee: string;
  estimated_delivery_time: string;
  neighborhood: string;
  city: string;
  payment_methods_text: string;
  accepts_pickup: boolean;
};

export default function DeliveryPage() {
  const profileQuery = useBusinessProfile();
  const mutations = useBusinessMutations();
  const form = useForm<DeliveryFormValues>({
    defaultValues: {
      delivery_fee: "",
      estimated_delivery_time: "",
      neighborhood: "",
      city: "",
      payment_methods_text: "",
      accepts_pickup: true
    }
  });

  useEffect(() => {
    if (!profileQuery.data) return;
    form.reset({
      delivery_fee: profileQuery.data.delivery_fee?.toString() ?? "",
      estimated_delivery_time: profileQuery.data.estimated_delivery_time ?? "",
      neighborhood: profileQuery.data.neighborhood ?? "",
      city: profileQuery.data.city ?? "",
      payment_methods_text: (profileQuery.data.payment_methods ?? []).join(", "),
      accepts_pickup: profileQuery.data.accepts_pickup
    });
  }, [profileQuery.data, form]);

  if (profileQuery.isLoading) {
    return <LoadingState label="Carregando entrega..." description="Buscando taxa, área atendida e tempo estimado." />;
  }

  if (profileQuery.error || !profileQuery.data) {
    return <ErrorState description="Não foi possível carregar a área de entrega." onRetry={() => void profileQuery.refetch()} />;
  }

  const profile = profileQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Entrega"
        title="Entrega e retirada"
        description="Defina taxa, área atendida, tempo estimado e formas de pagamento para o delivery responder tudo certo ao cliente."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard title="Taxa atual" description="Valor informado para entrega.">
          <p className="text-2xl font-semibold">{formatCurrencyBrl(profile.delivery_fee)}</p>
        </SectionCard>
        <SectionCard title="Tempo estimado" description="Previsão mostrada ao cliente.">
          <p className="text-2xl font-semibold">{profile.estimated_delivery_time || "Não definido"}</p>
        </SectionCard>
        <SectionCard title="Retirada no local" description="Disponibilidade para o cliente retirar.">
          <p className="text-2xl font-semibold">{profile.accepts_pickup ? "Ativada" : "Desativada"}</p>
        </SectionCard>
      </div>

      <SectionCard
        title="Configuração da entrega"
        description="Mantenha as informações atualizadas para reduzir dúvidas no atendimento."
      >
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              await mutations.updateBusinessProfileMutation.mutateAsync({
                business_name: profile.business_name,
                phone: profile.phone,
                address: profile.address,
                city: values.city || null,
                neighborhood: values.neighborhood || null,
                delivery_fee: values.delivery_fee ? Number(values.delivery_fee) : null,
                estimated_delivery_time: values.estimated_delivery_time || null,
                accepts_pickup: values.accepts_pickup,
                payment_methods: values.payment_methods_text
                  ? values.payment_methods_text.split(",").map((item) => item.trim()).filter(Boolean)
                  : [],
                welcome_message: profile.welcome_message,
                out_of_hours_message: profile.out_of_hours_message
              });
              toast.success("Entrega atualizada");
            } catch (error) {
              toast.error(getErrorMessage(error, "Não foi possível salvar os dados de entrega."));
            }
          })}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Taxa de entrega</p>
              <Input type="number" step="0.01" placeholder="Ex.: 7,00" {...form.register("delivery_fee")} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Tempo estimado</p>
              <Input placeholder="Ex.: 35 a 50 min" {...form.register("estimated_delivery_time")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Bairro principal atendido</p>
              <Input placeholder="Ex.: Centro, Jardim Paulista" {...form.register("neighborhood")} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Cidade</p>
              <Input placeholder="Ex.: São Paulo" {...form.register("city")} />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Formas de pagamento</p>
            <Input placeholder="PIX, Cartão, Dinheiro" {...form.register("payment_methods_text")} />
          </div>

          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div>
              <p className="font-medium">Permitir retirada no local</p>
              <p className="text-sm text-muted-foreground">Ative se o cliente puder buscar o pedido na loja.</p>
            </div>
            <Switch checked={form.watch("accepts_pickup")} onCheckedChange={(value) => form.setValue("accepts_pickup", value)} />
          </div>

          <Button type="submit" disabled={mutations.updateBusinessProfileMutation.isPending}>
            {mutations.updateBusinessProfileMutation.isPending ? "Salvando..." : "Salvar entrega"}
          </Button>
        </form>
      </SectionCard>
    </div>
  );
}
