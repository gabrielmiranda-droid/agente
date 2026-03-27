"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createCompany, getCompany, getCompanies, updateCompany, updateCompanyById } from "@/lib/api/companies";
import { queryKeys } from "@/lib/query-keys";

export function useCompany(companyId?: number) {
  return useQuery({ queryKey: queryKeys.company(companyId), queryFn: () => getCompany(companyId) });
}

export function useCompanies(enabled = true) {
  return useQuery({ queryKey: queryKeys.companies, queryFn: getCompanies, enabled });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCompany,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.companies });
    }
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCompany,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.company() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.companies });
    }
  });
}

export function useUpdateCompanyById() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, payload }: { companyId: number; payload: Parameters<typeof updateCompanyById>[1] }) =>
      updateCompanyById(companyId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.company() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.companies });
    }
  });
}
