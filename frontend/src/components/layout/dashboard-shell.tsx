"use client";

import { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useAuth } from "@/components/providers/auth-provider";
import { LoadingState } from "@/components/shared/loading-state";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <LoadingState label="Carregando painel..." description="Reconectando sua sessao e preparando os modulos." />
      </div>
    );
  }

  return (
    <div className="dashboard-grid flex h-[100dvh] min-h-screen overflow-hidden bg-background text-foreground">
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="dashboard-surface relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <div className="page-shell h-full min-h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
