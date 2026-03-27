"use client";

import { API_BASE_URL } from "@/lib/api/config";
import { destroySession, readSessionTokens, saveSession } from "@/lib/auth/session";
import type { AuthTokens } from "@/types/auth";

type RequestOptions = RequestInit & {
  authenticated?: boolean;
  retryOnUnauthorized?: boolean;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseErrorResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json().catch(() => null)) as
      | { detail?: string | { msg?: string }[] }
      | null;

    if (typeof payload?.detail === "string") {
      return payload.detail;
    }

    if (Array.isArray(payload?.detail)) {
      return payload.detail.map((item) => item.msg).filter(Boolean).join(" | ");
    }
  }

  const text = await response.text().catch(() => "");
  return text || "Falha na comunicação com a API";
}

async function refreshAccessToken() {
  const { refreshToken } = readSessionTokens();
  if (!refreshToken) {
    destroySession();
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ refresh_token: refreshToken })
  });

  if (!response.ok) {
    destroySession();
    return null;
  }

  const tokens = (await response.json()) as AuthTokens;
  saveSession(tokens);
  return tokens.access_token;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { authenticated = true, retryOnUnauthorized = true, headers, ...rest } = options;
  const { accessToken } = readSessionTokens();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(authenticated && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers
    }
  });

  if (response.status === 401 && authenticated && retryOnUnauthorized) {
    const refreshedToken = await refreshAccessToken();
    if (!refreshedToken) {
      throw new ApiError("Sessão expirada. Faça login novamente.", 401);
    }

    return apiRequest<T>(path, {
      ...options,
      retryOnUnauthorized: false
    });
  }

  if (!response.ok) {
    throw new ApiError(await parseErrorResponse(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
