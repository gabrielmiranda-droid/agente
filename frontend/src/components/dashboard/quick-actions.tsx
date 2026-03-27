import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type QuickActionItem = {
  title: string;
  description: string;
  href: "/companies" | "/whatsapp" | "/agents" | "/logs" | "/orders" | "/conversations" | "/menu" | "/metrics";
};

export function QuickActions({ actions }: { actions: QuickActionItem[] }) {
  return (
    <Card className="border-white/8 bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="text-base text-white">Acoes rapidas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-xl border border-white/8 bg-black/20 p-4 transition hover:bg-white/[0.04]"
          >
            <p className="text-sm font-medium text-white">{action.title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">{action.description}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm text-primary">
              Abrir
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
