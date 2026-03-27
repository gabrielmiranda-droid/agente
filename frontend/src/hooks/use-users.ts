"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createUser, getUsers } from "@/lib/api/users";
import { queryKeys } from "@/lib/query-keys";

export function useUsers(companyId?: number) {
  return useQuery({ queryKey: queryKeys.users(companyId), queryFn: () => getUsers(companyId) });
}

export function useCreateUser(companyId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createUser>[0]) => createUser(payload, companyId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users(companyId) });
    }
  });
}
