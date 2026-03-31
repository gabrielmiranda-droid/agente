"use client";

import Link from "next/link";
import { ArrowRightLeft, Store } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DeliveryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Entrega"
        title="Entrega e retirada"
        description="As configuracoes de entrega e retirada foram unificadas ao cadastro do negocio para evitar telas duplicadas."
      />

      <Card className="border-white/8 bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-base text-white">Fluxo unificado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-300">
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="font-medium text-white">Onde editar agora</p>
            <p className="mt-2 leading-6 text-slate-400">
              Taxa de entrega, tempo estimado, retirada no local, bairros atendidos e formas de pagamento ficam centralizados no modulo do negocio.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/business">
                <Store className="mr-2 h-4 w-4" />
                Abrir negocio
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/10 bg-transparent text-white hover:bg-white/[0.06]">
              <Link href="/dashboard">
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Voltar ao dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
