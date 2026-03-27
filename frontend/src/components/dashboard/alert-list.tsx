import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type DashboardAlert = {
  title: string;
  description: string;
  severity: "warning" | "critical";
};

export function AlertList({ alerts }: { alerts: DashboardAlert[] }) {
  return (
    <Card className="border-white/8 bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="text-base text-white">Alertas operacionais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length ? (
          alerts.map((alert, index) => (
            <div key={`${alert.title}-${index}`} className="flex items-start gap-3 rounded-xl border border-white/8 bg-black/20 p-4">
              <div
                className={
                  alert.severity === "critical"
                    ? "mt-0.5 text-rose-400"
                    : "mt-0.5 text-amber-400"
                }
              >
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">{alert.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{alert.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-white/8 bg-black/20 p-4">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-white">Sem alertas no momento</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">Nenhum problema critico foi identificado com os dados atuais.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
