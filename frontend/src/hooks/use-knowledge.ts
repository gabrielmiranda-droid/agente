"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createKnowledgeItem, getKnowledgeItems } from "@/lib/api/knowledge";
import { queryKeys } from "@/lib/query-keys";

export function useKnowledgeItems(companyId?: number) {
  return useQuery({ queryKey: queryKeys.knowledge(companyId), queryFn: () => getKnowledgeItems(companyId) });
}

export function useCreateKnowledgeItem(companyId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createKnowledgeItem>[0]) => createKnowledgeItem(payload, companyId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.knowledge(companyId) });
    }
  });
}
