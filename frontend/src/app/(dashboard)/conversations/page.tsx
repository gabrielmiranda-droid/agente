"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquareMore, PauseCircle, Search, UserCheck } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { ConversationList } from "@/components/conversations/conversation-list";
import { ConversationPanel } from "@/components/conversations/conversation-panel";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useConversationActions, useConversationMessages, useConversations } from "@/hooks/use-conversations";
import { useCompanyScope } from "@/hooks/use-company-scope";
import { getErrorMessage } from "@/lib/errors";
import type { ConversationStatus } from "@/types/conversation";

type ModeFilter = "all" | "ai" | "human";
type StatusFilter = "all" | ConversationStatus;

export default function ConversationsPage() {
  const { user } = useAuth();
  const companyId = useCompanyScope();
  const conversationsQuery = useConversations(companyId);
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState<ModeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredConversations = useMemo(() => {
    const conversations = conversationsQuery.data ?? [];
    const term = search.trim().toLowerCase();

    return conversations.filter((conversation) => {
      const matchesSearch =
        !term ||
        [
          String(conversation.id),
          conversation.contact_name ?? "",
          conversation.contact_phone_number ?? "",
          conversation.last_message_preview ?? "",
          conversation.status,
          conversation.human_handoff_active ? "humano" : "ia"
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);

      const matchesMode =
        modeFilter === "all" ||
        (modeFilter === "human" ? conversation.human_handoff_active : !conversation.human_handoff_active);

      const matchesStatus = statusFilter === "all" || conversation.status === statusFilter;

      return matchesSearch && matchesMode && matchesStatus;
    });
  }, [conversationsQuery.data, search, modeFilter, statusFilter]);

  useEffect(() => {
    if (!filteredConversations.length) {
      setSelectedId(undefined);
      return;
    }

    const stillVisible = filteredConversations.some((conversation) => conversation.id === selectedId);
    if (!selectedId || !stillVisible) {
      setSelectedId(filteredConversations[0].id);
    }
  }, [filteredConversations, selectedId]);

  const selectedConversation = useMemo(
    () => filteredConversations.find((conversation) => conversation.id === selectedId) ?? null,
    [filteredConversations, selectedId]
  );

  const messagesQuery = useConversationMessages(selectedId, companyId);
  const actions = useConversationActions(selectedId, companyId);

  const cards = useMemo(() => {
    const conversations = conversationsQuery.data ?? [];
    return {
      total: conversations.length,
      handoffs: conversations.filter((conversation) => conversation.human_handoff_active).length,
      paused: conversations.filter((conversation) => !conversation.bot_enabled).length
    };
  }, [conversationsQuery.data]);

  if (conversationsQuery.isLoading) {
    return (
      <LoadingState
        label="Carregando conversas..."
        description="Buscando clientes, histórico e status do atendimento da loja."
      />
    );
  }

  if (conversationsQuery.error) {
    return (
      <ErrorState
        description="Não foi possível carregar a central de conversas."
        onRetry={() => void conversationsQuery.refetch()}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <PageHeader
        eyebrow="Conversas"
        title="Atendimento da loja"
        description="Uma central em estilo WhatsApp para acompanhar clientes, assumir o atendimento e devolver para a IA quando necessário."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Clientes na fila" value={cards.total} icon={MessageSquareMore} hint="Conversas visíveis agora" />
        <StatCard title="Atendimento humano" value={cards.handoffs} icon={UserCheck} hint="Casos assumidos pela equipe" />
        <StatCard title="Bot pausado" value={cards.paused} icon={PauseCircle} hint="Conversas com automação parada" />
      </div>

      <div className="grid min-h-0 flex-1 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="flex min-h-0 flex-col overflow-hidden">
          <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-5">
            <div className="space-y-1">
              <p className="text-sm font-semibold">Lista de clientes</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Busque por nome, telefone ou trecho da mensagem e filtre rapidamente o tipo de atendimento.
              </p>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar cliente, telefone ou mensagem..."
                className="pl-10"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Modo de atendimento</p>
              <div className="flex flex-wrap items-center gap-2">
                {(["all", "ai", "human"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setModeFilter(value)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      modeFilter === value
                        ? "border-primary/20 bg-primary text-primary-foreground"
                        : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {value === "all" ? "Todos" : value === "ai" ? "IA atendendo" : "Humano atendendo"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Situação</p>
              <div className="flex flex-wrap items-center gap-2">
                {(["all", "open", "pending", "resolved"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      statusFilter === value
                        ? "border-border bg-secondary text-secondary-foreground"
                        : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {value === "all"
                      ? "Todas"
                      : value === "open"
                        ? "Em aberto"
                        : value === "pending"
                          ? "Em acompanhamento"
                          : "Encerradas"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border bg-muted/20 px-3 py-2">
              <p className="text-sm text-muted-foreground">Resultado do filtro</p>
              <Badge variant="neutral">{filteredConversations.length} conversas</Badge>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <ConversationList
                conversations={filteredConversations}
                selectedId={selectedId}
                onSelect={(conversation) => setSelectedId(conversation.id)}
              />
            </div>
          </CardContent>
        </Card>

        <ConversationPanel
          canManageBot={user?.role === "dev"}
          conversation={selectedConversation}
          messages={messagesQuery.data ?? []}
          loadingMessages={messagesQuery.isLoading}
          messageLoadError={Boolean(messagesQuery.error)}
          onUpdateConversation={async (payload) => {
            try {
              await actions.updateConversationMutation.mutateAsync(payload);
            } catch (error) {
              toast.error(getErrorMessage(error, "Não foi possível atualizar a conversa."));
              throw error;
            }
          }}
          onSend={async (payload) => {
            try {
              await actions.sendManualMessageMutation.mutateAsync(payload);
            } catch (error) {
              toast.error(getErrorMessage(error, "Não foi possível enviar a mensagem."));
              throw error;
            }
          }}
          onPause={async () => {
            try {
              await actions.pauseBotMutation.mutateAsync();
              toast.success("Bot pausado");
            } catch (error) {
              toast.error(getErrorMessage(error, "Não foi possível pausar o bot."));
            }
          }}
          onResume={async () => {
            try {
              await actions.resumeBotMutation.mutateAsync();
              toast.success("Bot reativado");
            } catch (error) {
              toast.error(getErrorMessage(error, "Não foi possível reativar o bot."));
            }
          }}
          onHandoff={async () => {
            try {
              await actions.handoffMutation.mutateAsync();
              toast.success("Atendimento assumido");
            } catch (error) {
              toast.error(getErrorMessage(error, "Não foi possível assumir o atendimento."));
            }
          }}
          onReturnToAi={async () => {
            try {
              await actions.returnToAiMutation.mutateAsync();
              toast.success("Conversa devolvida para a IA");
            } catch (error) {
              toast.error(getErrorMessage(error, "Não foi possível devolver a conversa para a IA."));
            }
          }}
        />
      </div>
    </div>
  );
}
