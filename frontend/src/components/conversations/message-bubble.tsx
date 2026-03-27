import { Bot, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDateTime, getMessageDirectionLabel } from "@/lib/formatters";
import type { Message } from "@/types/conversation";

export function MessageBubble({ message }: { message: Message }) {
  const isOutgoing = message.direction === "outgoing";

  return (
    <div className={cn("flex gap-3", isOutgoing ? "justify-end" : "justify-start")}>
      {!isOutgoing ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border bg-card text-muted-foreground">
          <UserRound className="h-4 w-4" />
        </div>
      ) : null}

      <div
        className={cn(
          "max-w-[78%] rounded-[1.6rem] border px-4 py-3 text-sm shadow-sm",
          isOutgoing
            ? "border-primary/20 bg-primary text-primary-foreground"
            : "bg-card text-card-foreground"
        )}
      >
        <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]">
          {message.ai_generated ? <Bot className="h-3.5 w-3.5" /> : null}
          <span>{message.ai_generated ? "IA" : getMessageDirectionLabel(message.direction)}</span>
        </div>
        <p className="whitespace-pre-wrap leading-6">{message.content}</p>
        <p
          className={cn(
            "mt-3 text-[11px]",
            isOutgoing ? "text-primary-foreground/75" : "text-muted-foreground"
          )}
        >
          {formatDateTime(message.created_at)}
        </p>
      </div>

      {isOutgoing ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border bg-primary/10 text-primary">
          <Bot className="h-4 w-4" />
        </div>
      ) : null}
    </div>
  );
}
