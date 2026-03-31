"use client";

import Link from "next/link";
import { ArrowRightLeft, WalletCards } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Relatorios"
        title="Relatorios consolidados"
        description="Esta area foi incorporada ao modulo financeiro para reduzir duplicidade e manter a operacao mais simples."
      />

      <Card className="border-white/8 bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-base text-white">Modulo reorganizado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-300">
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="font-medium text-white">O que mudou</p>
            <p className="mt-2 leading-6 text-slate-400">
              Indicadores de venda, ticket medio, formas de pagamento e produtos mais vendidos agora ficam em um unico lugar.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/finance">
                <WalletCards className="mr-2 h-4 w-4" />
                Abrir financeiro
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
