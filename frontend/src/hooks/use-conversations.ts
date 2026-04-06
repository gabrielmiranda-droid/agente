"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  closeHandoff,
  getConversationMessages,
  getConversations,
  pauseBot,
  resumeBot,
  sendManualMessage,
  startHandoff,
  updateConversation
} from "@/lib/api/conversations";
import { queryKeys } from "@/lib/query-keys";

export function useConversations(companyId?: number) {
  return useQuery({
    queryKey: queryKeys.conversations(companyId),
    queryFn: () => getConversations(companyId),
    refetchInterval: 10_000
  });
}

export function useConversationMessages(conversationId?: number, companyId?: number) {
  return useQuery({
    queryKey: queryKeys.conversationMessages(conversationId, companyId),
    queryFn: () => getConversationMessages(conversationId as number, companyId),
    enabled: Boolean(conversationId),
    refetchInterval: conversationId ? 5_000 : false
  });
}

export function useConversationActions(conversationId?: number, companyId?: number) {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.conversations(companyId) });
    await queryClient.invalidateQueries({ queryKey: queryKeys.conversationMessages(conversationId, companyId) });
  };

  return {
    handoffMutation: useMutation({
      mutationFn: () => startHandoff(conversationId as number, {}, companyId),
      onSuccess: invalidate
    }),
    returnToAiMutation: useMutation({
      mutationFn: () => closeHandoff(conversationId as number, { restore_bot: true }, companyId),
      onSuccess: invalidate
    }),
    pauseBotMutation: useMutation({
      mutationFn: () => pauseBot(conversationId as number, companyId),
      onSuccess: invalidate
    }),
    resumeBotMutation: useMutation({
      mutationFn: () => resumeBot(conversationId as number, companyId),
      onSuccess: invalidate
    }),
    updateConversationMutation: useMutation({
      mutationFn: (payload: { status?: "open" | "pending" | "resolved"; bot_enabled?: boolean; internal_notes?: string | null; tags?: string[] | null }) =>
        updateConversation(conversationId as number, payload, companyId),
      onSuccess: invalidate
    }),
    sendManualMessageMutation: useMutation({
      mutationFn: (payload: { content: string }) => sendManualMessage(conversationId as number, payload, companyId),
      onSuccess: invalidate
    })
  };
}
