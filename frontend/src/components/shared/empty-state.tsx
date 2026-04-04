import { Inbox, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card className="overflow-hidden border-dashed border-white/10 bg-white/[0.025]">
      <CardContent className="flex min-h-56 flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] border border-white/10 bg-white/[0.04] text-primary shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
          <Inbox className="h-5 w-5" />
        </div>
        <div className="max-w-md space-y-1.5">
          <p className="text-base font-semibold text-white">{title}</p>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-400">
          <Sparkles className="h-3.5 w-3.5" />
          Aguardando movimento
        </div>
        {actionLabel && onAction ? (
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
