"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getClientPanel, getDevPanel, getFinanceSummary, getInventory, getOperationalOrders, updateOperationalOrderStatus } from "@/lib/api/operations";
import { queryKeys } from "@/lib/query-keys";
import type { OperationalOrderStatus } from "@/types/operations";

export function useClientPanel(companyId?: number) {
  return useQuery({
    queryKey: queryKeys.clientPanel(companyId),
    queryFn: () => getClientPanel(companyId),
    refetchInterval: 10_000
  });
}

export function useDevPanel() {
  return useQuery({
    queryKey: queryKeys.devPanel,
    queryFn: getDevPanel
  });
}

export function useOperationalOrders(companyId?: number) {
  return useQuery({
    queryKey: queryKeys.operationalOrders(companyId),
    queryFn: () => getOperationalOrders(companyId),
    refetchInterval: 5_000
  });
}

export function useOperationalInventory(companyId?: number) {
  return useQuery({
    queryKey: queryKeys.inventory(companyId),
    queryFn: () => getInventory(companyId)
  });
}

export function useFinanceSummary(companyId?: number) {
  return useQuery({
    queryKey: queryKeys.financeSummary(companyId),
    queryFn: () => getFinanceSummary(companyId)
  });
}

export function useOperationalOrderActions(companyId?: number) {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: OperationalOrderStatus }) =>
      updateOperationalOrderStatus(orderId, status, companyId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.operationalOrders(companyId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.clientPanel(companyId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.financeSummary(companyId) })
      ]);
    }
  });

  return { updateStatusMutation };
}
