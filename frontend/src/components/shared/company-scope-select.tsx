"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { useCompanies } from "@/hooks/use-company";

export function CompanyScopeSelect() {
  const { user } = useAuth();
  const companiesQuery = useCompanies(user?.role === "dev");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedValue = searchParams.get("companyId") ?? "";
  const companies = useMemo(() => companiesQuery.data ?? [], [companiesQuery.data]);

  if (user?.role !== "dev") {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-4 md:flex-row md:items-center md:px-5">
      <div className="space-y-1">
        <p className="text-sm font-medium text-white">Empresa em foco</p>
        <p className="text-xs leading-5 text-slate-400">
          Troque a conta ativa para revisar negocio, equipe, FAQ, cardapio e operacao sem sair do painel master.
        </p>
      </div>
      <select
        value={selectedValue}
        className="h-11 min-w-[220px] rounded-[1.05rem] border border-border/80 bg-background/88 px-4 text-sm text-white outline-none transition duration-200 hover:border-border focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/10 md:ml-auto"
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString());
          if (!event.target.value) {
            params.delete("companyId");
          } else {
            params.set("companyId", event.target.value);
          }
          const query = params.toString();
          router.replace((query ? `${pathname}?${query}` : pathname) as never);
        }}
      >
        <option value="">Minha empresa</option>
        {companies.map((company) => (
          <option key={company.id} value={String(company.id)}>
            {company.name}
          </option>
        ))}
      </select>
    </div>
  );
}
