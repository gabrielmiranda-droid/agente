import { REFRESH_COOKIE, TOKEN_COOKIE } from "@/lib/constants/app";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export function setAuthCookies(accessToken: string, refreshToken: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_COOKIE}=${accessToken}; path=/; max-age=${THIRTY_DAYS}; samesite=lax`;
  document.cookie = `${REFRESH_COOKIE}=${refreshToken}; path=/; max-age=${THIRTY_DAYS}; samesite=lax`;
}

export function clearAuthCookies() {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; samesite=lax`;
  document.cookie = `${REFRESH_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));
  return match?.split("=")[1] ?? null;
}

export function getAccessToken() {
  return getCookie(TOKEN_COOKIE);
}

export function getRefreshToken() {
  return getCookie(REFRESH_COOKIE);
}

