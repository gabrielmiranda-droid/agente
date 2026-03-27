"use client";

import { ReactNode } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { isDev } from "@/lib/auth/roles";

export function DevOnlyPage({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState label="Validando acesso..." description="Conferindo permissões do perfil atual." />;
  }

  if (!isDev(user)) {
    return (
      <ErrorState
        title="Acesso restrito"
        description="Esta área está disponível apenas para o perfil dev."
      />
    );
  }

  return <>{children}</>;
}
