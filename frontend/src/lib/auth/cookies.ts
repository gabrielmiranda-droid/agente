import { REFRESH_COOKIE, TOKEN_COOKIE } from "@/lib/constants/app";

const THIRTY_DAYS = 60 * 60 * 24 * 30;
const DEFAULT_COOKIE_ATTRIBUTES = `path=/; max-age=${THIRTY_DAYS}; samesite=lax`;
const EXPIRED_COOKIE_ATTRIBUTES = "path=/; max-age=0; samesite=lax";

function writeCookie(name: string, value: string, attributes: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; ${attributes}`;
}

export function setAuthCookies(accessToken: string, refreshToken: string) {
  if (typeof document === "undefined") return;
  writeCookie(TOKEN_COOKIE, accessToken, DEFAULT_COOKIE_ATTRIBUTES);
  writeCookie(REFRESH_COOKIE, refreshToken, DEFAULT_COOKIE_ATTRIBUTES);
}

export function clearAuthCookies() {
  if (typeof document === "undefined") return;
  writeCookie(TOKEN_COOKIE, "", EXPIRED_COOKIE_ATTRIBUTES);
  writeCookie(REFRESH_COOKIE, "", EXPIRED_COOKIE_ATTRIBUTES);
}

export function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const match = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));

  if (!match) {
    return null;
  }

  const value = match.slice(prefix.length);

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function getAccessToken() {
  return getCookie(TOKEN_COOKIE);
}

export function getRefreshToken() {
  return getCookie(REFRESH_COOKIE);
}
