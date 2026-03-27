"use client";

import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyScope } from "@/hooks/use-company-scope";
import { useConversationActions, useConversations } from "@/hooks/use-conversations";
import { getContactDisplayName, formatDateTime, formatPhoneNumber } from "@/lib/formatters";
import { getErrorMessage } from "@/lib/errors";
import type { Conversation } from "@/types/conversation";

type OrderStage = "new" | "preparing" | "delivery" | "finished";

function getOrderStage(conversation: Conversation): OrderStage {
  if (conversation.status === "resolved") return "finished";
  if (conversation.tags?.includes("entrega")) return "delivery";
  if (conversation.status === "pending") return "preparing";
  return "new";
}

const stageMeta: Record<OrderStage, { title: string; badge: "warning" | "neutral" | "default" | "success" }> = {
  new: { title: "Novo pedido", badge: "warning" },
  preparing: { title: "Em preparo", badge: "default" },
  delivery: { title: "Saiu para entrega", badge: "neutral" },
  finished: { title: "Finalizado", badge: "success" }
};

export default function OrdersPage() {
  const companyId = useCompanyScope();
  const conversationsQuery = useConversations(companyId);

  if (conversationsQuery.isLoading) {
    return <LoadingState label="Carregando pedidos..." description="Buscando pedidos recebidos pela operação." />;
  }

  if (conversationsQuery.error) {
    return <ErrorState description="Não foi possível carregar os pedidos." onRetry={() => void conversationsQuery.refetch()} />;
  }

  const conversations = conversationsQuery.data ?? [];
  const groups: Record<OrderStage, Conversation[]> = {
    new: [],
    preparing: [],
    delivery: [],
    finished: []
  };

  conversations.forEach((conversation) => {
    groups[getOrderStage(conversation)].push(conversation);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pedidos"
        title="Pedidos da operação"
        description="Acompanhe o andamento dos pedidos recebidos pelo WhatsApp e organize o fluxo entre novo, preparo, entrega e finalização."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {(["new", "preparing", "delivery", "finished"] as OrderStage[]).map((stage) => (
          <OrderColumn key={stage} stage={stage} conversations={groups[stage]} />
        ))}
      </div>
    </div>
  );
}

function OrderColumn({ stage, conversations }: { stage: OrderStage; conversations: Conversation[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span>{stageMeta[stage].title}</span>
          <Badge variant={stageMeta[stage].badge}>{conversations.length}</Badge>
        </CardTitle>
        <CardDescription>
          {stage === "new" && "Pedidos recém-chegados esperando triagem."}
          {stage === "preparing" && "Pedidos que já entraram no fluxo de produção."}
          {stage === "delivery" && "Pedidos em rota ou aguardando retirada."}
          {stage === "finished" && "Pedidos já concluídos ou encerrados."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {conversations.length ? (
          conversations.map((conversation) => <OrderCard key={conversation.id} conversation={conversation} />)
        ) : (
          <EmptyState
            title="Nenhum pedido"
            description="Assim que a operação receber pedidos neste estágio, eles aparecerão aqui."
          />
        )}
      </CardContent>
    </Card>
  );
}

function OrderCard({ conversation }: { conversation: Conversation }) {
  const companyId = useCompanyScope();
  const actions = useConversationActions(conversation.id, companyId);

  const moveTo = async (stage: OrderStage) => {
    const nextPayload =
      stage === "new"
        ? { status: "open" as const, tags: (conversation.tags ?? []).filter((item) => item !== "entrega") }
        : stage === "preparing"
          ? { status: "pending" as const, tags: (conversation.tags ?? []).filter((item) => item !== "entrega") }
          : stage === "delivery"
            ? { status: "pending" as const, tags: [...new Set([...(conversation.tags ?? []), "entrega"])] }
            : { status: "resolved" as const, tags: conversation.tags ?? [] };

    try {
      await actions.updateConversationMutation.mutateAsync(nextPayload);
      toast.success("Pedido atualizado");
    } catch (error) {
      toast.error(getErrorMessage(error, "Não foi possível atualizar o pedido."));
    }
  };

  return (
    <div className="rounded-[1.4rem] border p-4">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium">
              {getContactDisplayName(conversation.contact_name, conversation.contact_phone_number)}
            </p>
            <p className="text-sm text-muted-foreground">{formatPhoneNumber(conversation.contact_phone_number)}</p>
          </div>
          <Badge variant="neutral">#{conversation.id}</Badge>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
          {conversation.last_message_preview ?? "Sem detalhes do pedido."}
        </p>

        <p className="text-xs text-muted-foreground">Última atualização: {formatDateTime(conversation.updated_at)}</p>

        {conversation.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {conversation.tags.map((tag) => (
              <Badge key={tag} variant="neutral">
                #{tag}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={() => void moveTo("new")}>
            Novo
          </Button>
          <Button size="sm" variant="outline" onClick={() => void moveTo("preparing")}>
            Preparo
          </Button>
          <Button size="sm" variant="outline" onClick={() => void moveTo("delivery")}>
            Entrega
          </Button>
          <Button size="sm" variant="outline" onClick={() => void moveTo("finished")}>
            Finalizar
          </Button>
        </div>
      </div>
    </div>
  );
}
