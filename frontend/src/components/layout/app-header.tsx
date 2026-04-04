"use client";

import Link from "next/link";
import { ChevronRight, Shield, Store } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { useCompanies, useCompany } from "@/hooks/use-company";
import { getRoleExperience, getRoleLabel, isDev } from "@/lib/auth/roles";
import { dashboardNavigation } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  conversations: "Conversas",
  orders: "Pedidos",
  business: "Negocio",
  menu: "Cardapio",
  inventory: "Estoque",
  finance: "Financeiro",
  hours: "Horarios",
  promotions: "Promocoes",
  settings: "Configuracoes",
  companies: "Empresas",
  whatsapp: "WhatsApp",
  agents: "IA / Tokens",
  billing: "Billing",
  logs: "Logs",
  metrics: "Resumo",
  users: "Acessos"
};

type NavigationItem = (typeof dashboardNavigation)[number]["items"][number];

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
  const navigationItems = dashboardNavigation.reduce<NavigationItem[]>((items, section) => {
    section.items.forEach((item) => {
      items.push(item as NavigationItem);
    });
    return items;
  }, []);
  const visibleNavigationItems = navigationItems.filter((item) => !user?.role || item.roles.includes(user.role));

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => segmentLabels[segment] ?? segment);

  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-background/78 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[1680px]">
        <div className="flex items-start justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
              {segments.map((segment, index) => (
                <div className="flex items-center gap-2" key={segment + index}>
                  {index > 0 ? <ChevronRight className="h-3.5 w-3.5" /> : null}
                  <span className={index === segments.length - 1 ? "text-slate-100" : ""}>{segment}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 text-white">
                {isDev(user) ? <Shield className="h-3.5 w-3.5 text-primary" /> : <Store className="h-3.5 w-3.5 text-primary" />}
                {roleExperience.headerBadge}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-medium text-white">
                {focusedCompany?.name ?? "Conta ativa"}
              </span>
              <span className="text-muted-foreground">{getRoleLabel(user?.role)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right lg:block">
              <p className="text-sm font-medium text-white">{user?.name ?? "Usuario"}</p>
              <p className="text-xs text-slate-500">{user?.email ?? "Sessao ativa"}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="min-w-[88px] border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
            >
              Sair
            </Button>
          </div>
        </div>

        <div className="border-t border-white/6 lg:hidden">
          <nav className="flex gap-2 overflow-x-auto px-4 py-3 sm:px-6">
            {visibleNavigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-2 text-sm transition-all",
                    isActive
                      ? "border-primary/20 bg-primary/12 text-white"
                      : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/16 hover:text-white"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-slate-500")} />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
