import {
  Bot,
  Building2,
  ClipboardList,
  Clock3,
  CreditCard,
  Gauge,
  HelpCircle,
  MessageSquareText,
  MessagesSquare,
  ReceiptText,
  ScrollText,
  ShoppingBag,
  Store,
  Tag,
  Truck,
  Users2,
  WalletCards
} from "lucide-react";

import type { AppRole } from "@/lib/auth/roles";

export const dashboardNavigation = [
  {
    title: "Operacao",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: Gauge, roles: ["attendant"] as AppRole[] },
      { title: "Conversas", href: "/conversations", icon: MessagesSquare, roles: ["attendant"] as AppRole[] },
      { title: "Pedidos", href: "/orders", icon: ClipboardList, roles: ["attendant"] as AppRole[] },
      { title: "Relatorios", href: "/reports", icon: ReceiptText, roles: ["attendant"] as AppRole[] }
    ]
  },
  {
    title: "Cadastro da Loja",
    items: [
      { title: "Negocio", href: "/business", icon: Store, roles: ["attendant"] as AppRole[] },
      { title: "Cardapio", href: "/menu", icon: ShoppingBag, roles: ["attendant"] as AppRole[] },
      { title: "Entrega", href: "/delivery", icon: Truck, roles: ["attendant"] as AppRole[] },
      { title: "Horarios", href: "/hours", icon: Clock3, roles: ["attendant"] as AppRole[] },
      { title: "Promocoes", href: "/promotions", icon: Tag, roles: ["attendant"] as AppRole[] },
      { title: "FAQ", href: "/knowledge", icon: HelpCircle, roles: ["attendant"] as AppRole[] },
      { title: "Equipe", href: "/users", icon: Users2, roles: ["attendant"] as AppRole[] },
      { title: "Configuracoes", href: "/settings", icon: MessageSquareText, roles: ["attendant"] as AppRole[] }
    ]
  },
  {
    title: "Plataforma",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: Gauge, roles: ["dev"] as AppRole[] },
      { title: "Empresas", href: "/companies", icon: Building2, roles: ["dev"] as AppRole[] },
      { title: "WhatsApp", href: "/whatsapp", icon: MessageSquareText, roles: ["dev"] as AppRole[] },
      { title: "Agentes", href: "/agents", icon: Bot, roles: ["dev"] as AppRole[] },
      { title: "Billing", href: "/billing", icon: CreditCard, roles: ["dev"] as AppRole[] },
      { title: "Logs", href: "/logs", icon: ScrollText, roles: ["dev"] as AppRole[] },
      { title: "Metricas", href: "/metrics", icon: WalletCards, roles: ["dev"] as AppRole[] }
    ]
  },
  {
    title: "Empresa em foco",
    items: [
      { title: "Negocio", href: "/business", icon: Store, roles: ["dev"] as AppRole[] },
      { title: "Equipe", href: "/users", icon: Users2, roles: ["dev"] as AppRole[] },
      { title: "FAQ", href: "/knowledge", icon: HelpCircle, roles: ["dev"] as AppRole[] },
      { title: "Configuracoes", href: "/settings", icon: MessageSquareText, roles: ["dev"] as AppRole[] }
    ]
  }
] as const;
