import type { Conversation, ConversationStatus, MessageDirection } from "@/types/conversation";

export function formatDateTime(value?: string | null) {
  if (!value) return "Sem registro";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatDate(value?: string | null) {
  if (!value) return "Sem registro";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short"
  }).format(new Date(value));
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

export function formatCurrencyUsd(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

export function formatCurrencyBrl(value?: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export function getConversationMode(conversation: Conversation) {
  return conversation.human_handoff_active ? "Atendimento humano" : "IA no atendimento";
}

export function getConversationStatusLabel(status: ConversationStatus) {
  const labels: Record<ConversationStatus, string> = {
    open: "Em aberto",
    pending: "Em acompanhamento",
    resolved: "Encerrada"
  };
  return labels[status] ?? status;
}

export function getMessageDirectionLabel(direction: MessageDirection) {
  return direction === "incoming" ? "Cliente" : "Loja";
}

export function formatPhoneNumber(value?: string | null) {
  if (!value) return "Telefone não disponível";
  const digits = value.replace(/\D/g, "");
  if (digits.length === 13) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 12) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`;
  }
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return value;
}

export function getContactDisplayName(name?: string | null, phone?: string | null) {
  return name?.trim() || formatPhoneNumber(phone);
}

export function getInitials(name?: string | null, phone?: string | null) {
  const label = name?.trim();
  if (label) {
    const parts = label.split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  }
  return (phone ?? "?").replace(/\D/g, "").slice(-2) || "?";
}
