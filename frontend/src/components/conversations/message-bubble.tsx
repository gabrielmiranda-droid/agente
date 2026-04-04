import { Bot, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDateTime, getMessageDirectionLabel } from "@/lib/formatters";
import type { Message } from "@/types/conversation";

export function MessageBubble({ message }: { message: Message }) {
  const isOutgoing = message.direction === "outgoing";
  const label = message.ai_generated ? "IA" : getMessageDirectionLabel(message.direction);

  return (
    <div className={cn("flex items-end gap-2.5", isOutgoing ? "justify-end" : "justify-start")}>
      {!isOutgoing ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-white/8 bg-white/[0.04] text-muted-foreground">
          <UserRound className="h-4 w-4" />
        </div>
      ) : null}

      <div
        className={cn(
          "max-w-[82%] border px-4 py-3.5 text-sm shadow-[0_12px_30px_rgba(0,0,0,0.18)] xl:max-w-[46rem]",
          isOutgoing
            ? "rounded-[1.45rem] rounded-br-md border-primary/20 bg-[linear-gradient(180deg,rgba(249,115,22,0.92),rgba(234,88,12,0.92))] text-primary-foreground"
            : "rounded-[1.45rem] rounded-bl-md border-white/8 bg-card/96 text-card-foreground"
        )}
      >
        <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]">
          {message.ai_generated ? <Bot className="h-3.5 w-3.5" /> : null}
          <span>{label}</span>
        </div>
        <p className="whitespace-pre-wrap leading-6">{message.content}</p>
        <p className={cn("mt-3 text-[11px]", isOutgoing ? "text-primary-foreground/75" : "text-muted-foreground")}>
          {formatDateTime(message.created_at)}
        </p>
      </div>

      {isOutgoing ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-primary/15 bg-primary/10 text-primary">
          <Bot className="h-4 w-4" />
        </div>
      ) : null}
    </div>
  );
}
