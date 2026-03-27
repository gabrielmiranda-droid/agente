"use client";

import { ChevronRight, Shield, Store } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { useCompanies, useCompany } from "@/hooks/use-company";
import { getRoleExperience, getRoleLabel, isDev } from "@/lib/auth/roles";

const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  conversations: "Conversas",
  orders: "Pedidos",
  business: "Negocio",
  menu: "Cardapio",
  delivery: "Entrega",
  hours: "Horarios",
  promotions: "Promocoes",
  settings: "Configuracoes",
  reports: "Relatorios",
  companies: "Empresas",
  whatsapp: "WhatsApp",
  agents: "Agentes",
  billing: "Billing",
  logs: "Logs",
  metrics: "Metricas",
  knowledge: "FAQ",
  users: "Equipe"
};

export function AppHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const focusedCompanyId = searchParams.get("companyId");
  const companyId = focusedCompanyId ? Number(focusedCompanyId) : undefined;
  const companyQuery = useCompany(Number.isFinite(companyId) ? companyId : undefined);
  const companiesQuery = useCompanies(user?.role === "dev");
  const roleExperience = getRoleExperience(user?.role);
  const focusedCompany =
    companiesQuery.data?.find((company) => String(company.id) === focusedCompanyId) ?? companyQuery.data ?? null;

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => segmentLabels[segment] ?? segment);

  return (
    <header className="sticky top-0 z-20 border-b border-white/6 bg-black/90">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            {segments.map((segment, index) => (
              <div className="flex items-center gap-2" key={segment + index}>
                {index > 0 ? <ChevronRight className="h-4 w-4" /> : null}
                <span className={index === segments.length - 1 ? "font-medium text-white" : ""}>{segment}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-white">
              {isDev(user) ? <Shield className="h-3.5 w-3.5 text-primary" /> : <Store className="h-3.5 w-3.5 text-primary" />}
              {roleExperience.headerBadge}
            </span>
            <span className="font-medium text-white">{focusedCompany?.name ?? "Conta ativa"}</span>
            <span className="text-slate-500">{getRoleLabel(user?.role)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium text-white">{user?.name ?? "Usuario"}</p>
            <p className="text-xs text-slate-500">{user?.email ?? "Sessao ativa"}</p>
          </div>
          <Button variant="outline" onClick={logout} className="border-white/10 bg-transparent text-white hover:bg-white/[0.06]">
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
