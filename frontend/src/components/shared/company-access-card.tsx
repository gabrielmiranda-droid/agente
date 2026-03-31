import { KeyRound, ShieldCheck, Store } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CompanyAccessCard() {
  return (
    <Card className="border-white/8 bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="text-base text-white">Acesso da empresa</CardTitle>
        <CardDescription className="text-slate-500">
          O cadastro da empresa ja cria o acesso inicial para o cliente operar a conta.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-3 rounded-xl border border-white/8 bg-black/20 p-4">
          <Store className="mt-0.5 h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-medium text-white">Conta separada por empresa</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Cada empresa enxerga apenas os dados da propria operacao.
            </p>
          </div>
        </div>
        <div className="flex gap-3 rounded-xl border border-white/8 bg-black/20 p-4">
          <KeyRound className="mt-0.5 h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-medium text-white">Login inicial</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Use o nome, e-mail e senha definidos no cadastro para entregar o primeiro acesso ao cliente.
            </p>
          </div>
        </div>
        <div className="flex gap-3 rounded-xl border border-white/8 bg-black/20 p-4">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-medium text-white">Papeis simples</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              `dev` controla a plataforma. `client` opera apenas a propria empresa sem tocar em configuracoes tecnicas.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
