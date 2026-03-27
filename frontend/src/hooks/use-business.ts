"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAddon,
  createBusinessHour,
  createCategory,
  createProduct,
  createPromotion,
  getAddons,
  getBusinessHours,
  getBusinessProfile,
  getCategories,
  getProducts,
  getPromotions,
  updateAddon,
  updateBusinessHour,
  updateBusinessProfile,
  updateCategory,
  updateProduct,
  updatePromotion
} from "@/lib/api/business";
import { queryKeys } from "@/lib/query-keys";

export function useBusinessProfile(companyId?: number) {
  return useQuery({
    queryKey: queryKeys.businessProfile(companyId),
    queryFn: () => getBusinessProfile(companyId)
  });
}

export function useCategories(companyId?: number) {
  return useQuery({
    queryKey: queryKeys.categories(companyId),
    queryFn: () => getCategories(companyId)
  });
}

export function useProducts(companyId?: number) {
  return useQuery({
    queryKey: queryKeys.products(companyId),
    queryFn: () => getProducts(companyId)
  });
}

export function useAddons(companyId?: number) {
  return useQuery({
    queryKey: queryKeys.addons(companyId),
    queryFn: () => getAddons(companyId)
  });
}

export function useBusinessHours(companyId?: number) {
  return useQuery({
    queryKey: queryKeys.businessHours(companyId),
    queryFn: () => getBusinessHours(companyId)
  });
}

export function usePromotions(companyId?: number) {
  return useQuery({
    queryKey: queryKeys.promotions(companyId),
    queryFn: () => getPromotions(companyId)
  });
}

export function useBusinessMutations(companyId?: number) {
  const queryClient = useQueryClient();

  const invalidateCatalog = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.businessProfile(companyId) });
    await queryClient.invalidateQueries({ queryKey: queryKeys.categories(companyId) });
    await queryClient.invalidateQueries({ queryKey: queryKeys.products(companyId) });
    await queryClient.invalidateQueries({ queryKey: queryKeys.addons(companyId) });
    await queryClient.invalidateQueries({ queryKey: queryKeys.businessHours(companyId) });
    await queryClient.invalidateQueries({ queryKey: queryKeys.promotions(companyId) });
  };

  return {
    updateBusinessProfileMutation: useMutation({
      mutationFn: (payload: Record<string, unknown>) => updateBusinessProfile(payload, companyId),
      onSuccess: invalidateCatalog
    }),
    createCategoryMutation: useMutation({
      mutationFn: (payload: Record<string, unknown>) => createCategory(payload, companyId),
      onSuccess: invalidateCatalog
    }),
    updateCategoryMutation: useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) => updateCategory(id, payload, companyId),
      onSuccess: invalidateCatalog
    }),
    createProductMutation: useMutation({
      mutationFn: (payload: Record<string, unknown>) => createProduct(payload, companyId),
      onSuccess: invalidateCatalog
    }),
    updateProductMutation: useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) => updateProduct(id, payload, companyId),
      onSuccess: invalidateCatalog
    }),
    createAddonMutation: useMutation({
      mutationFn: (payload: Record<string, unknown>) => createAddon(payload, companyId),
      onSuccess: invalidateCatalog
    }),
    updateAddonMutation: useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) => updateAddon(id, payload, companyId),
      onSuccess: invalidateCatalog
    }),
    createBusinessHourMutation: useMutation({
      mutationFn: (payload: Record<string, unknown>) => createBusinessHour(payload, companyId),
      onSuccess: invalidateCatalog
    }),
    updateBusinessHourMutation: useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) => updateBusinessHour(id, payload, companyId),
      onSuccess: invalidateCatalog
    }),
    createPromotionMutation: useMutation({
      mutationFn: (payload: Record<string, unknown>) => createPromotion(payload, companyId),
      onSuccess: invalidateCatalog
    }),
    updatePromotionMutation: useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) => updatePromotion(id, payload, companyId),
      onSuccess: invalidateCatalog
    })
  };
}
