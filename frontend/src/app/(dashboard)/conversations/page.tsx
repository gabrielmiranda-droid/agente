"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquareMore, PauseCircle, Search, SlidersHorizontal, UserCheck, X, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { ConversationContextPanel } from "@/components/conversations/conversation-context-panel";
import { ConversationList } from "@/components/conversations/conversation-list";
import { ConversationPanel } from "@/components/conversations/conversation-panel";
import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [isContextOpen, setIsContextOpen] = useState(false);

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
          conversation.human_handoff_active ? "humano" : "ia",
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
    [filteredConversations, selectedId],
  );

  useEffect(() => {
    if (selectedConversation) {
      setIsContextOpen(false);
    }
  }, [selectedConversation?.id]);

  const messagesQuery = useConversationMessages(selectedId, companyId);
  const actions = useConversationActions(selectedId, companyId);

  const cards = useMemo(() => {
    const conversations = conversationsQuery.data ?? [];
    return {
      total: conversations.length,
      handoffs: conversations.filter((conversation) => conversation.human_handoff_active).length,
      paused: conversations.filter((conversation) => !conversation.bot_enabled).length,
    };
  }, [conversationsQuery.data]);

  if (conversationsQuery.isLoading) {
    return (
      <LoadingState
        label="Carregando conversas..."
        description="Buscando clientes, historico e status do atendimento da loja."
      />
    );
  }

  if (conversationsQuery.error) {
    return (
      <ErrorState
        description="Nao foi possivel carregar a central de conversas."
        onRetry={() => void conversationsQuery.refetch()}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <PageHeader
        eyebrow="Conversas"
        title="Atendimento da loja"
        description="Inbox operacional com foco total no chat, acompanhamento rapido e intervencao humana imediata."
        actions={
          <Button
            variant="outline"
            className="rounded-2xl xl:hidden"
            onClick={() => setIsContextOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Abrir painel
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 rounded-[1.4rem] border border-white/8 bg-black/25 px-4 py-2.5">
        <InlineMetric icon={MessageSquareMore} label="Clientes na fila" value={cards.total} />
        <InlineMetric icon={UserCheck} label="Atendimento humano" value={cards.handoffs} />
        <InlineMetric icon={PauseCircle} label="Bot pausado" value={cards.paused} />
      </div>

      <div className="grid min-h-0 flex-1 gap-3 overflow-hidden xl:grid-cols-[260px_minmax(0,1fr)_280px]">
        <Card className="flex min-h-0 flex-col overflow-hidden">
          <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold">Clientes</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Busque e filtre rapidamente para abrir a conversa certa.
              </p>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar cliente ou mensagem..."
                className="pl-10"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Modo</p>
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
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Situacao</p>
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
              <p className="text-sm text-muted-foreground">Filtro</p>
              <Badge variant="neutral">{filteredConversations.length} conversas</Badge>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
              <ConversationList
                conversations={filteredConversations}
                selectedId={selectedId}
                onSelect={(conversation) => setSelectedId(conversation.id)}
              />
            </div>
          </CardContent>
        </Card>

        <ConversationPanel
          conversation={selectedConversation}
          messages={messagesQuery.data ?? []}
          loadingMessages={messagesQuery.isLoading}
          messageLoadError={Boolean(messagesQuery.error)}
          showContextPanel={isContextOpen}
          onToggleContextPanel={() => setIsContextOpen((current) => !current)}
          onSend={async (payload) => {
            try {
              await actions.sendManualMessageMutation.mutateAsync(payload);
            } catch (error) {
              toast.error(getErrorMessage(error, "Nao foi possivel enviar a mensagem."));
              throw error;
            }
          }}
          onHandoff={async () => {
            try {
              await actions.handoffMutation.mutateAsync();
              toast.success("Atendimento assumido");
            } catch (error) {
              toast.error(getErrorMessage(error, "Nao foi possivel assumir o atendimento."));
            }
          }}
          onReturnToAi={async () => {
            try {
              await actions.returnToAiMutation.mutateAsync();
              toast.success("Conversa devolvida para a IA");
            } catch (error) {
              toast.error(getErrorMessage(error, "Nao foi possivel devolver a conversa para a IA."));
            }
          }}
          onResume={async () => {
            try {
              await actions.resumeBotMutation.mutateAsync();
              toast.success("Bot reativado");
            } catch (error) {
              toast.error(getErrorMessage(error, "Nao foi possivel reativar o bot."));
            }
          }}
        />

        <ConversationContextPanel
          conversation={selectedConversation}
          onUpdateConversation={async (payload) => {
            try {
              await actions.updateConversationMutation.mutateAsync(payload);
            } catch (error) {
              toast.error(getErrorMessage(error, "Nao foi possivel atualizar a conversa."));
              throw error;
            }
          }}
          className="hidden xl:flex xl:flex-col"
        />
      </div>

      {isContextOpen ? (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm xl:hidden">
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-white/10 bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-white">Painel lateral</p>
                <p className="text-xs text-muted-foreground">Notas, tags e contexto da conversa.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsContextOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="min-h-0 flex-1 p-4">
              <ConversationContextPanel
                conversation={selectedConversation}
                onUpdateConversation={async (payload) => {
                  try {
                    await actions.updateConversationMutation.mutateAsync(payload);
                    setIsContextOpen(false);
                  } catch (error) {
                    toast.error(getErrorMessage(error, "Nao foi possivel atualizar a conversa."));
                    throw error;
                  }
                }}
                className="h-full border-0 bg-transparent shadow-none"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InlineMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}
