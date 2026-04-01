"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bot,
  PauseCircle,
  Phone,
  PlayCircle,
  Save,
  SendHorizonal,
  Sparkles,
  Tag,
  UserCheck,
  UserRoundCog
} from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { MessageBubble } from "@/components/conversations/message-bubble";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { manualMessageSchema, type ManualMessageSchema } from "@/lib/validations/conversation";
import {
  formatDateTime,
  formatPhoneNumber,
  getContactDisplayName,
  getConversationMode,
  getConversationStatusLabel,
  getInitials
} from "@/lib/formatters";
import type { Conversation, Message } from "@/types/conversation";

export function ConversationPanel({
  canManageBot = false,
  conversation,
  messages,
  loadingMessages = false,
  messageLoadError = false,
  onSend,
  onPause,
  onResume,
  onHandoff,
  onReturnToAi,
  onUpdateConversation
}: {
  canManageBot?: boolean;
  conversation: Conversation | null;
  messages: Message[];
  loadingMessages?: boolean;
  messageLoadError?: boolean;
  onSend: (payload: ManualMessageSchema) => Promise<void>;
  onPause: () => Promise<void>;
  onResume: () => Promise<void>;
  onHandoff: () => Promise<void>;
  onReturnToAi: () => Promise<void>;
  onUpdateConversation: (payload: { internal_notes?: string | null; tags?: string[] | null }) => Promise<void>;
}) {
  const form = useForm<ManualMessageSchema>({
    resolver: zodResolver(manualMessageSchema),
    defaultValues: { content: "" }
  });

  const contextForm = useForm<{ internal_notes: string; tags: string }>({
    defaultValues: { internal_notes: "", tags: "" }
  });

  useEffect(() => {
    contextForm.reset({
      internal_notes: conversation?.internal_notes ?? "",
      tags: conversation?.tags?.join(", ") ?? ""
    });
  }, [conversation?.id, conversation?.internal_notes, conversation?.tags, contextForm]);

  if (!conversation) {
    return (
      <Card className="h-full min-h-0">
        <CardContent className="flex h-full min-h-[560px] items-center justify-center">
          <div className="max-w-md space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.6rem] border bg-accent text-accent-foreground">
              <UserRoundCog className="h-6 w-6" />
            </div>
            <p className="text-lg font-semibold">Selecione uma conversa</p>
            <p className="text-sm leading-6 text-muted-foreground">
              Abra uma conversa na coluna ao lado para ver o histórico, registrar contexto interno e responder
              manualmente.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="border-b bg-card/80">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.4rem] border bg-primary/10 text-base font-semibold text-primary">
              {getInitials(conversation.contact_name, conversation.contact_phone_number)}
            </div>

            <div className="min-w-0 space-y-3">
              <div>
                <CardTitle className="truncate text-xl">
                  {getContactDisplayName(conversation.contact_name, conversation.contact_phone_number)}
                </CardTitle>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {formatPhoneNumber(conversation.contact_phone_number)}
                  </span>
                  <span>Conversa #{conversation.id}</span>
                  <span>Última atividade em {formatDateTime(conversation.last_message_at ?? conversation.updated_at)}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={conversation.human_handoff_active ? "warning" : "success"}>
                  {getConversationMode(conversation)}
                </Badge>
                <Badge variant="neutral">{getConversationStatusLabel(conversation.status)}</Badge>
                <Badge variant={conversation.bot_enabled ? "default" : "danger"}>
                  {conversation.bot_enabled ? "Bot ativo" : "Bot pausado"}
                </Badge>
                {conversation.assigned_user_id ? <Badge variant="neutral">Atribuída #{conversation.assigned_user_id}</Badge> : null}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void onHandoff()}>
              <UserCheck className="h-4 w-4" />
              Assumir humano
            </Button>
            <Button variant="outline" onClick={() => void onReturnToAi()}>
              <Sparkles className="h-4 w-4" />
              Devolver para IA
            </Button>
            {canManageBot ? (
              <>
                <Button variant="outline" onClick={() => void onPause()}>
                  <PauseCircle className="h-4 w-4" />
                  Pausar bot
                </Button>
                <Button variant="outline" onClick={() => void onResume()}>
                  <PlayCircle className="h-4 w-4" />
                  Reativar bot
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid flex-1 gap-0 overflow-hidden p-0 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex min-h-0 flex-col overflow-hidden bg-muted/10">
          <div className="border-b bg-background/85 px-6 py-3 text-sm text-muted-foreground">
            {conversation.human_handoff_active ? (
              <span className="inline-flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-amber-500" />
                Atendimento em modo humano. A IA está temporariamente bloqueada para esta conversa.
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                Atendimento assistido por IA com possibilidade de intervenção manual imediata.
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain bg-[linear-gradient(180deg,rgba(255,255,255,0.26),transparent_18%)] px-6 py-6 dark:bg-none">
            {loadingMessages ? (
              <div className="space-y-3">
                <div className="h-20 w-2/3 rounded-[1.6rem] bg-muted" />
                <div className="ml-auto h-24 w-1/2 rounded-[1.6rem] bg-primary/15" />
                <div className="h-16 w-3/5 rounded-[1.6rem] bg-muted" />
              </div>
            ) : messageLoadError ? (
              <div className="rounded-3xl border border-dashed p-6 text-sm text-muted-foreground">
                Não foi possível carregar as mensagens desta conversa agora.
              </div>
            ) : messages.length ? (
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed p-6 text-sm text-muted-foreground">
                Ainda não há mensagens registradas nesta conversa.
              </div>
            )}
          </div>

          <div className="border-t bg-background px-6 py-5">
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
                className="h-12 flex-1 rounded-2xl"
                {...form.register("content")}
              />
              <Button type="submit" className="h-12 px-5">
                <SendHorizonal className="h-4 w-4" />
                Enviar mensagem
              </Button>
            </form>
            {form.formState.errors.content ? (
              <p className="mt-2 text-xs text-rose-500">{form.formState.errors.content.message}</p>
            ) : null}
          </div>
        </div>

        <aside className="min-h-0 overflow-y-auto overscroll-contain border-l bg-background/90 p-5">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold">Contexto interno</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Registre observações da equipe e organize esta conversa com tags.
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={contextForm.handleSubmit(async (values) => {
                const tags = values.tags
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean);

                try {
                  await onUpdateConversation({
                    internal_notes: values.internal_notes.trim() || null,
                    tags: tags.length ? tags : null
                  });
                  toast.success("Contexto atualizado");
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Falha ao salvar contexto");
                }
              })}
            >
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Notas internas</p>
                <Textarea
                  rows={7}
                  placeholder="Ex.: cliente pediu retorno no fim da tarde, prefere retirada no local."
                  {...contextForm.register("internal_notes")}
                />
              </div>

              <div className="space-y-2">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <Tag className="h-3.5 w-3.5" />
                  Tags
                </p>
                <Input placeholder="vip, urgente, retorno, orçamento" {...contextForm.register("tags")} />
                <p className="text-xs leading-5 text-muted-foreground">Separe as tags por vírgula para facilitar o filtro e o contexto.</p>
              </div>

              {conversation.tags?.length ? (
                <div className="flex flex-wrap gap-2">
                  {conversation.tags.map((tag) => (
                    <Badge key={tag} variant="neutral">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              ) : null}

              <Button type="submit" variant="outline" className="w-full">
                <Save className="h-4 w-4" />
                Salvar contexto
              </Button>
            </form>
          </div>
        </aside>
      </CardContent>
    </Card>
  );
}
