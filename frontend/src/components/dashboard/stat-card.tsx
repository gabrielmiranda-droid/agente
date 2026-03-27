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
    <Card className="overflow-hidden border-white/8 bg-white/[0.03] backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
            <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-primary/70 via-cyan-300/70 to-emerald-400/70" />
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-[1.2rem] bg-primary/12 text-primary">
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
