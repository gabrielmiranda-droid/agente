import type { CurrentUser } from "@/types/auth";

export type AppRole = "dev" | "client";

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
  return user?.role === "client";
}

export function getRoleLabel(role?: string | null) {
  if (role === "dev") return "Painel Dev";
  if (role === "client") return "Painel do Cliente";
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
    label: "Painel do Cliente",
    sidebarTitle: "Operacao da Empresa",
    sidebarDescription:
      "Gerencie pedidos, atendimento, cardapio, estoque, financeiro e dados do negocio sem configuracoes tecnicas.",
    headerBadge: "Painel cliente"
  };
}
