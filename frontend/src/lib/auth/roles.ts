import type { CurrentUser } from "@/types/auth";

export type AppRole = "dev" | "attendant";

type RoleExperience = {
  label: string;
  sidebarTitle: string;
  sidebarDescription: string;
  headerBadge: string;
};

export function isDev(user?: Pick<CurrentUser, "role"> | null) {
  return user?.role === "dev";
}

export function isAttendant(user?: Pick<CurrentUser, "role"> | null) {
  return user?.role === "attendant";
}

export function getRoleLabel(role?: string | null) {
  if (role === "dev") return "Painel Dev";
  if (role === "attendant") return "Painel da Loja";
  return "Usuario";
}

export function getRoleExperience(role?: string | null): RoleExperience {
  if (role === "dev") {
    return {
      label: "Painel Dev",
      sidebarTitle: "Admin Master do SaaS",
      sidebarDescription:
        "Controle empresas, canais, IA, cobranca, metricas e suporte tecnico da plataforma em um unico console.",
      headerBadge: "Admin master"
    };
  }

  return {
    label: "Painel da Loja",
    sidebarTitle: "Central da Empresa",
    sidebarDescription:
      "Gerencie atendimento, operacao, produtos, horarios, FAQ e configuracoes do negocio sem linguagem tecnica.",
    headerBadge: "Operacao da loja"
  };
}
