"use client";

import { ReactNode } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { LoadingState } from "@/components/shared/loading-state";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <LoadingState label="Carregando painel..." description="Reconectando sua sessão e preparando os módulos." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <AppHeader />
        <main className="dashboard-surface flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="page-shell">{children}</div>
        </main>
      </div>
    </div>
  );
}
