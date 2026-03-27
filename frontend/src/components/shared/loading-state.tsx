import { LoaderCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function LoadingState({
  label = "Carregando dados...",
  description = "Preparando a próxima etapa da operação."
}: {
  label?: string;
  description?: string;
}) {
  return (
    <Card className="overflow-hidden border-dashed bg-card/80">
      <CardContent className="flex min-h-64 flex-col items-center justify-center gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-primary/10 text-primary">
          <LoaderCircle className="h-6 w-6 animate-spin" />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-base font-semibold">{label}</p>
          <p className="max-w-lg text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <div className="grid w-full max-w-lg gap-3">
          <div className="h-3 rounded-full bg-muted/80" />
          <div className="h-3 w-11/12 rounded-full bg-muted/60" />
          <div className="h-3 w-8/12 rounded-full bg-muted/50" />
          <div className="h-24 rounded-[1.35rem] border border-dashed bg-muted/30" />
        </div>
      </CardContent>
    </Card>
  );
}
