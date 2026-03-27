"use client";

import { apiRequest } from "@/lib/api/client";
import type { AuthTokens, CurrentUser } from "@/types/auth";

export async function login(payload: { email: string; password: string }) {
  return apiRequest<AuthTokens>("/auth/login", {
    method: "POST",
    authenticated: false,
    body: JSON.stringify(payload)
  });
}

export async function getCurrentUser() {
  return apiRequest<CurrentUser>("/auth/me");
}

