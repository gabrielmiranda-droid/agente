import { AlertTriangle, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ErrorState({
  title = "Algo saiu do fluxo esperado",
  description = "Revise a conexão com a API ou tente novamente em instantes.",
  actionLabel = "Tentar novamente",
  onRetry
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="border-rose-200/70 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/10">
      <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="max-w-lg space-y-1">
          <p className="text-base font-semibold">{title}</p>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCcw className="h-4 w-4" />
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
