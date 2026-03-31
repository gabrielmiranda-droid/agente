"use client";

import Link from "next/link";
import { Building2, ChevronRight, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { useCompanies } from "@/hooks/use-company";
import { getRoleExperience, getRoleLabel, isDev } from "@/lib/auth/roles";
import { dashboardNavigation } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const roleExperience = getRoleExperience(user?.role);
  const companiesQuery = useCompanies(user?.role === "dev");
  const companiesCount = companiesQuery.data?.length ?? 0;

  const visibleSections = dashboardNavigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !user?.role || item.roles.includes(user.role))
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className="hidden w-[300px] shrink-0 border-r border-white/8 bg-black/55 backdrop-blur-xl xl:flex xl:flex-col">
      <div className="border-b border-white/8 px-5 py-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-primary/20 to-amber-300/10 text-primary shadow-[0_12px_30px_rgba(249,115,22,0.18)]">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">{roleExperience.sidebarTitle}</p>
            <p className="text-xs leading-5 text-slate-500">{roleExperience.sidebarDescription}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        {visibleSections.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition",
                      isActive
                        ? "border border-primary/20 bg-gradient-to-r from-primary/18 to-amber-300/10 font-medium text-white shadow-[0_14px_34px_rgba(249,115,22,0.12)]"
                        : "border border-transparent text-slate-400 hover:border-white/8 hover:bg-white/[0.04] hover:text-white"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-slate-500")} />
                    <span className="flex-1">{item.title}</span>
                    {isActive ? <div className="h-2 w-2 rounded-full bg-primary" /> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/8 p-4">
        <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-white">{getRoleLabel(user?.role)}</p>
          </div>

          {isDev(user) ? (
            <div className="mt-3 space-y-2 text-sm text-slate-400">
              <div className="flex items-center justify-between">
                <span>Empresas no SaaS</span>
                <span className="font-medium text-white">{companiesCount}</span>
              </div>
              <Link href="/companies" className="inline-flex items-center gap-1 text-sm font-medium text-white">
                Administrar contas
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Atualize apenas os dados operacionais da sua empresa: pedidos, cardapio, estoque, horarios e atendimento.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
