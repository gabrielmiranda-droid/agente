import { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({
  title,
  value,
  hint,
  icon: Icon
}: {
  title: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="overflow-hidden border-white/8 bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-black/30 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
            <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-primary via-amber-300 to-emerald-400/70" />
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-[1.2rem] border border-primary/15 bg-primary/10 text-primary shadow-[0_10px_30px_rgba(249,115,22,0.14)]">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight text-white">{value}</div>
        {hint ? <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
