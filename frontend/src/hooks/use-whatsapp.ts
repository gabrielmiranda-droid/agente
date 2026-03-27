"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createWhatsappInstance, getWhatsappInstances } from "@/lib/api/whatsapp";
import { queryKeys } from "@/lib/query-keys";

export function useWhatsappInstances(companyId?: number) {
  return useQuery({ queryKey: queryKeys.whatsappInstances(companyId), queryFn: () => getWhatsappInstances(companyId) });
}

export function useCreateWhatsappInstance(companyId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createWhatsappInstance>[0]) => createWhatsappInstance(payload, companyId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.whatsappInstances(companyId) });
    }
  });
}
