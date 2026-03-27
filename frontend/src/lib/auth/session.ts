import { clearAuthCookies, getAccessToken, getRefreshToken, setAuthCookies } from "@/lib/auth/cookies";
import type { AuthTokens } from "@/types/auth";

export function saveSession(tokens: AuthTokens) {
  setAuthCookies(tokens.access_token, tokens.refresh_token);
}

export function destroySession() {
  clearAuthCookies();
}

export function hasSession() {
  return Boolean(getAccessToken());
}

export function readSessionTokens() {
  return {
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken()
  };
}

