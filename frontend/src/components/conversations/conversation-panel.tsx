"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bot,
  Phone,
  PlayCircle,
  SendHorizonal,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  UserRoundCog,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { MessageBubble } from "@/components/conversations/message-bubble";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { manualMessageSchema, type ManualMessageSchema } from "@/lib/validations/conversation";
import {
  formatDateTime,
  formatPhoneNumber,
  getContactDisplayName,
  getConversationMode,
  getConversationStatusLabel,
  getInitials,
} from "@/lib/formatters";
import type { Conversation, Message } from "@/types/conversation";

export function ConversationPanel({
  conversation,
  messages,
  loadingMessages = false,
  messageLoadError = false,
  onSend,
  onHandoff,
  onReturnToAi,
  onResume,
  showContextPanel,
  onToggleContextPanel,
}: {
  conversation: Conversation | null;
  messages: Message[];
  loadingMessages?: boolean;
  messageLoadError?: boolean;
  onSend: (payload: ManualMessageSchema) => Promise<void>;
  onHandoff: () => Promise<void>;
  onReturnToAi: () => Promise<void>;
  onResume: () => Promise<void>;
  showContextPanel: boolean;
  onToggleContextPanel: () => void;
}) {
  const form = useForm<ManualMessageSchema>({
    resolver: zodResolver(manualMessageSchema),
    defaultValues: { content: "" },
  });

  if (!conversation) {
    return (
      <Card className="h-full min-h-0">
        <CardContent className="flex h-full min-h-[520px] items-center justify-center p-6">
          <div className="max-w-md space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.6rem] border bg-accent text-accent-foreground">
              <UserRoundCog className="h-6 w-6" />
            </div>
            <p className="text-xl font-semibold">Selecione uma conversa</p>
            <p className="text-sm leading-6 text-muted-foreground">
              Abra um cliente na lateral para acompanhar o historico, responder manualmente e operar o atendimento.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="sticky top-0 z-20 border-b bg-card/96 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.15rem] border bg-primary/10 text-base font-semibold text-primary">
              {getInitials(conversation.contact_name, conversation.contact_phone_number)}
            </div>

            <div className="min-w-0 space-y-2">
              <div>
                <CardTitle className="truncate text-lg text-white">
                  {getContactDisplayName(conversation.contact_name, conversation.contact_phone_number)}
                </CardTitle>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {formatPhoneNumber(conversation.contact_phone_number)}
                  </span>
                  <span>Conversa #{conversation.id}</span>
                  <span>Ultima atividade em {formatDateTime(conversation.last_message_at ?? conversation.updated_at)}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant={conversation.human_handoff_active ? "warning" : "success"}>
                  {getConversationMode(conversation)}
                </Badge>
                <Badge variant="neutral">{getConversationStatusLabel(conversation.status)}</Badge>
                <Badge variant={conversation.bot_enabled ? "default" : "danger"}>
                  {conversation.bot_enabled ? "Bot ativo" : "Bot pausado"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="rounded-2xl xl:hidden"
              onClick={onToggleContextPanel}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {showContextPanel ? "Ocultar painel" : "Painel"}
            </Button>
            <Button variant="outline" className="rounded-2xl px-4" onClick={() => void onHandoff()}>
              <UserCheck className="h-4 w-4" />
              Assumir humano
            </Button>
            <Button variant="outline" className="rounded-2xl px-4" onClick={() => void onReturnToAi()}>
              <Sparkles className="h-4 w-4" />
              Devolver para IA
            </Button>
            {!conversation.bot_enabled ? (
              <Button variant="outline" className="rounded-2xl px-4" onClick={() => void onResume()}>
                <PlayCircle className="h-4 w-4" />
                Reativar bot
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        <div className="border-b bg-background/85 px-4 py-2.5 text-sm text-muted-foreground">
          {conversation.human_handoff_active ? (
            <span className="inline-flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-amber-500" />
              Atendimento em modo humano. A IA esta temporariamente bloqueada para esta conversa.
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              Atendimento assistido por IA com intervencao manual imediata.
            </span>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent_20%)] px-4 py-4 dark:bg-none">
          {loadingMessages ? (
            <div className="space-y-4">
              <div className="h-20 w-2/3 rounded-[1.8rem] bg-muted" />
              <div className="ml-auto h-24 w-1/2 rounded-[1.8rem] bg-primary/15" />
              <div className="h-16 w-3/5 rounded-[1.8rem] bg-muted" />
            </div>
          ) : messageLoadError ? (
            <div className="rounded-3xl border border-dashed p-6 text-sm text-muted-foreground">
              Nao foi possivel carregar as mensagens desta conversa agora.
            </div>
          ) : messages.length ? (
            <div className="space-y-5">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed p-6 text-sm text-muted-foreground">
              Ainda nao ha mensagens registradas nesta conversa.
            </div>
          )}
        </div>

        <div className="sticky bottom-0 border-t bg-background/96 px-4 py-3 backdrop-blur">
          <form
            className="flex flex-col gap-3 md:flex-row"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                await onSend(values);
                form.reset();
                toast.success("Mensagem enviada");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Falha ao enviar mensagem");
              }
            })}
          >
            <Input
              placeholder="Digite uma resposta manual para esta conversa..."
              className="h-12 flex-1 rounded-[1.35rem] border-white/10 bg-black/25 px-5"
              {...form.register("content")}
            />
            <Button type="submit" className="h-12 rounded-[1.35rem] px-6 shadow-[0_18px_35px_rgba(249,115,22,0.22)]">
              <SendHorizonal className="h-4 w-4" />
              Enviar mensagem
            </Button>
          </form>
          {form.formState.errors.content ? (
            <p className="mt-2 text-xs text-rose-500">{form.formState.errors.content.message}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
