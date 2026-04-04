"use client";

import { Save, Tag } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/conversation";

export function ConversationContextPanel({
  conversation,
  onUpdateConversation,
  className = ""
}: {
  conversation: Conversation | null;
  onUpdateConversation: (payload: { internal_notes?: string | null; tags?: string[] | null }) => Promise<void>;
  className?: string;
}) {
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
      <Card className={cn("min-h-0 flex flex-col", className)}>
        <CardContent className="flex min-h-[320px] flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
          Selecione uma conversa para abrir notas internas, tags e contexto operacional.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("flex h-full min-h-0 flex-col overflow-hidden", className)}>
      <CardHeader className="border-b border-white/6 bg-card/96">
        <CardTitle className="text-base text-white">Contexto interno</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">Notas da equipe, tags e informacoes rapidas da conversa.</p>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-y-auto p-5">
        <form
          className="space-y-5"
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
              rows={10}
              placeholder="Ex.: cliente pediu retorno no fim da tarde, prefere retirada no local."
              className="min-h-[220px]"
              {...contextForm.register("internal_notes")}
            />
          </div>

          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <Tag className="h-3.5 w-3.5" />
              Tags
            </p>
            <Input placeholder="vip, urgente, retorno, orcamento" {...contextForm.register("tags")} />
            <p className="text-xs leading-5 text-muted-foreground">Separe por virgula para organizar filtros e contexto.</p>
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
      </CardContent>
    </Card>
  );
}
