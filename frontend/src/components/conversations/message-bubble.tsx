import { Bot, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDateTime, getMessageDirectionLabel } from "@/lib/formatters";
import type { Message } from "@/types/conversation";

export function MessageBubble({ message }: { message: Message }) {
  const isOutgoing = message.direction === "outgoing";

  return (
    <div className={cn("flex items-end gap-3", isOutgoing ? "justify-end" : "justify-start")}>
      {!isOutgoing ? (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-card text-muted-foreground">
          <UserRound className="h-4 w-4" />
        </div>
      ) : null}

      <div
        className={cn(
          "max-w-[82%] rounded-[1.75rem] border px-5 py-4 text-sm shadow-[0_12px_30px_rgba(0,0,0,0.18)]",
          isOutgoing
            ? "border-primary/20 bg-primary text-primary-foreground"
            : "border-white/8 bg-card/96 text-card-foreground"
        )}
      >
        <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]">
          {message.ai_generated ? <Bot className="h-3.5 w-3.5" /> : null}
          <span>{message.ai_generated ? "IA" : getMessageDirectionLabel(message.direction)}</span>
        </div>
        <p className="whitespace-pre-wrap leading-7">{message.content}</p>
        <p
          className={cn(
            "mt-4 text-[11px]",
            isOutgoing ? "text-primary-foreground/75" : "text-muted-foreground"
          )}
        >
          {formatDateTime(message.created_at)}
        </p>
      </div>

      {isOutgoing ? (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
          <Bot className="h-4 w-4" />
        </div>
      ) : null}
    </div>
  );
}
