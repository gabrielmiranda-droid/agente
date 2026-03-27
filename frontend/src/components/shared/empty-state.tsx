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
      <CardContent className="flex min-h-72 flex-col items-center justify-center gap-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-white/8 bg-white/[0.04] text-primary shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
          <Inbox className="h-6 w-6" />
        </div>
        <div className="max-w-md space-y-1.5">
          <p className="text-lg font-semibold text-white">{title}</p>
          <p className="text-sm leading-6 text-slate-500">{description}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-400">
          <Sparkles className="h-3.5 w-3.5" />
          Espaco pronto para crescimento
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
