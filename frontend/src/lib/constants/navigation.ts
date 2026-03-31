import {
  Bot,
  Building2,
  ClipboardList,
  Clock3,
  CreditCard,
  Gauge,
  MessageSquareText,
  MessagesSquare,
  Package,
  Settings2,
  ShoppingBag,
  Store,
  Tags,
  Users2,
  WalletCards,
  Waypoints
} from "lucide-react";

import type { AppRole } from "@/lib/auth/roles";

export const dashboardNavigation = [
  {
    title: "Painel Cliente",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: Gauge, roles: ["client"] as AppRole[] },
      { title: "Conversas", href: "/conversations", icon: MessagesSquare, roles: ["client"] as AppRole[] },
      { title: "Pedidos", href: "/orders", icon: ClipboardList, roles: ["client"] as AppRole[] },
      { title: "Cardapio", href: "/menu", icon: ShoppingBag, roles: ["client"] as AppRole[] },
      { title: "Estoque", href: "/inventory", icon: Package, roles: ["client"] as AppRole[] },
      { title: "Financeiro", href: "/finance", icon: WalletCards, roles: ["client"] as AppRole[] },
      { title: "Horarios", href: "/hours", icon: Clock3, roles: ["client"] as AppRole[] },
      { title: "Promocoes", href: "/promotions", icon: Tags, roles: ["client"] as AppRole[] },
      { title: "Negocio", href: "/business", icon: Store, roles: ["client"] as AppRole[] }
    ]
  },
  {
    title: "Painel Dev",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: Gauge, roles: ["dev"] as AppRole[] },
      { title: "Empresas", href: "/companies", icon: Building2, roles: ["dev"] as AppRole[] },
      { title: "Usuarios", href: "/users", icon: Users2, roles: ["dev"] as AppRole[] },
      { title: "WhatsApp", href: "/whatsapp", icon: MessageSquareText, roles: ["dev"] as AppRole[] },
      { title: "IA / Tokens", href: "/agents", icon: Bot, roles: ["dev"] as AppRole[] },
      { title: "Billing", href: "/billing", icon: CreditCard, roles: ["dev"] as AppRole[] },
      { title: "Logs", href: "/logs", icon: Waypoints, roles: ["dev"] as AppRole[] },
      { title: "Metricas", href: "/metrics", icon: WalletCards, roles: ["dev"] as AppRole[] },
      { title: "Configuracoes", href: "/settings", icon: Settings2, roles: ["dev"] as AppRole[] }
    ]
  }
] as const;
