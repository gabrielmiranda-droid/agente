import { AlertTriangle, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ErrorState({
  title = "Algo saiu do fluxo esperado",
  description = "Revise a conexao com a API ou tente novamente em instantes.",
  actionLabel = "Tentar novamente",
  onRetry
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="border-rose-500/20 bg-rose-500/[0.08]">
      <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-rose-500/20 bg-rose-500/12 text-rose-200">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="max-w-lg space-y-1">
          <p className="text-base font-semibold text-white">{title}</p>
          <p className="text-sm leading-6 text-slate-300">{description}</p>
        </div>
        {onRetry ? (
          <Button variant="outline" onClick={onRetry} className="border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/14">
            <RefreshCcw className="h-4 w-4" />
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
