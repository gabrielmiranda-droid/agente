"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createAgent, getAgents } from "@/lib/api/agents";
import { queryKeys } from "@/lib/query-keys";

export function useAgents(companyId?: number) {
  return useQuery({ queryKey: queryKeys.agents(companyId), queryFn: () => getAgents(companyId) });
}

export function useCreateAgent(companyId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createAgent>[0]) => createAgent(payload, companyId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.agents(companyId) });
    }
  });
}
