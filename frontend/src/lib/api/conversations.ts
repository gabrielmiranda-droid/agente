"use client";

import { apiRequest } from "@/lib/api/client";
import { withCompanyScope } from "@/lib/api/company-scope";
import type { Conversation, Message } from "@/types/conversation";

export function getConversations(companyId?: number) {
  return apiRequest<Conversation[]>(withCompanyScope("/conversations", companyId));
}

export function getConversationMessages(conversationId: number, companyId?: number) {
  return apiRequest<Message[]>(withCompanyScope(`/conversations/${conversationId}/messages`, companyId));
}

export function updateConversation(
  conversationId: number,
  payload: Partial<Pick<Conversation, "status" | "bot_enabled" | "internal_notes" | "tags">>,
  companyId?: number
) {
  return apiRequest<Conversation>(withCompanyScope(`/conversations/${conversationId}`, companyId), {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function startHandoff(conversationId: number, payload: { assigned_user_id?: number; reason?: string }, companyId?: number) {
  return apiRequest<{ detail: string; handoff_id: number }>(withCompanyScope(`/conversations/${conversationId}/handoff`, companyId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function closeHandoff(conversationId: number, payload: { restore_bot: boolean }, companyId?: number) {
  return apiRequest<{ detail: string }>(withCompanyScope(`/conversations/${conversationId}/handoff/close`, companyId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function pauseBot(conversationId: number, companyId?: number) {
  return apiRequest<{ detail: string }>(withCompanyScope(`/conversations/${conversationId}/pause-bot`, companyId), {
    method: "POST"
  });
}

export function resumeBot(conversationId: number, companyId?: number) {
  return apiRequest<{ detail: string }>(withCompanyScope(`/conversations/${conversationId}/resume-bot`, companyId), {
    method: "POST"
  });
}

export function sendManualMessage(conversationId: number, payload: { content: string }, companyId?: number) {
  return apiRequest<Message>(withCompanyScope(`/conversations/${conversationId}/messages`, companyId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
