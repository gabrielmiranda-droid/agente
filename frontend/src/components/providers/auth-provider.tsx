"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { getCurrentUser, login as loginRequest } from "@/lib/api/auth";
import { destroySession, hasSession, saveSession } from "@/lib/auth/session";
import type { CurrentUser } from "@/types/auth";

type AuthContextValue = {
  user: CurrentUser | null;
  loading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = async () => {
    if (!hasSession()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      destroySession();
      setUser(null);
      if (!pathname.startsWith("/login")) {
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, [pathname]);

  const login = async (payload: { email: string; password: string }) => {
    const tokens = await loginRequest(payload);
    saveSession(tokens);
    await refreshUser();
    router.replace("/dashboard");
  };

  const logout = () => {
    destroySession();
    setUser(null);
    router.replace("/login");
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      refreshUser
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
