import { Phone, SearchSlash } from "lucide-react";

import type { Conversation, ConversationStatus } from "@/types/conversation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  formatDateTime,
  formatPhoneNumber,
  getContactDisplayName,
  getConversationMode,
  getConversationStatusLabel,
  getInitials,
} from "@/lib/formatters";

export function ConversationList({
  conversations,
  selectedId,
  onSelect
}: {
  conversations: Conversation[];
  selectedId?: number;
  onSelect: (conversation: Conversation) => void;
}) {
  if (!conversations.length) {
    return (
      <div className="flex min-h-60 flex-col items-center justify-center gap-3 rounded-[1.8rem] border border-dashed bg-muted/15 p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <SearchSlash className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="font-medium">Nenhuma conversa no filtro atual</p>
          <p className="text-sm text-muted-foreground">
            Ajuste os filtros para localizar a conversa desejada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const statusVariant: Record<ConversationStatus, "default" | "neutral" | "success"> = {
          open: "default",
          pending: "neutral",
          resolved: "success"
        };

        return (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onSelect(conversation)}
            className={cn(
              "w-full rounded-[1.35rem] border p-3 text-left transition-all",
              selectedId === conversation.id
                ? "border-primary/20 bg-primary/[0.08] shadow-[0_16px_40px_rgba(14,165,233,0.10)]"
                : "bg-card hover:border-primary/15 hover:bg-muted/35"
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] text-sm font-semibold",
                  selectedId === conversation.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {getInitials(conversation.contact_name, conversation.contact_phone_number)}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {getContactDisplayName(conversation.contact_name, conversation.contact_phone_number)}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span className="truncate">
                        {formatPhoneNumber(conversation.contact_phone_number)}
                      </span>
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium text-muted-foreground">
                      {formatDateTime(conversation.last_message_at ?? conversation.updated_at)}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">#{conversation.id}</p>
                  </div>
                </div>

                <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
                  {conversation.last_message_preview ?? "Sem mensagens registradas ainda."}
                </p>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant={conversation.human_handoff_active ? "warning" : "success"}>
                    {getConversationMode(conversation)}
                  </Badge>
                  <Badge variant={statusVariant[conversation.status]}>
                    {getConversationStatusLabel(conversation.status)}
                  </Badge>
                  <Badge variant={conversation.bot_enabled ? "neutral" : "danger"}>
                    {conversation.bot_enabled ? "Bot ativo" : "Bot pausado"}
                  </Badge>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
