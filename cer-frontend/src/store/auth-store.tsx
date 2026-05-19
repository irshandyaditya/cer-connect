"use client";

/**
 * Simple auth store — tidak pakai Zustand/Redux, cukup pakai localStorage
 * + custom hook agar gampang di-consume di mana saja.
 *
 * Cara pakai:
 *   const { token, user, role, setAuth, clearAuth } = useAuth();
 */

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AuthUser, decodeJwt } from "@/lib/api";
import Cookies from "js-cookie"; // npm i js-cookie @types/js-cookie

// ── Types ──────────────────────────────────────────────────────────────

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  role: "STUDENT" | "TEACHER" | null;
  groupId: string | null;
};

type AuthContextValue = AuthState & {
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  isLoggedIn: boolean;
};

// ── Storage keys ───────────────────────────────────────────────────────

const TOKEN_KEY = "cer_token";
const USER_KEY  = "cer_user";

// ── Context ────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    role: null,
    groupId: null,
  });

  // Hydrate dari localStorage saat mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    if (token && userRaw) {
      try {
        const user: AuthUser = JSON.parse(userRaw);
        const jwt = decodeJwt(token);
        // Cek token belum expired
        if (jwt && jwt.exp * 1000 > Date.now()) {
          setState({ token, user, role: jwt.role, groupId: jwt.group });
        } else {
          // Token expired, bersihkan
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      } catch {
        // ignore parse error
      }
    }
  }, []);

    function setAuth(token: string, user: AuthUser) {
        const jwt = decodeJwt(token);
        
        // localStorage (untuk hydrate state)
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        
        // cookie (untuk middleware bisa baca)
        Cookies.set("cer_token", token, {
            expires: jwt ? new Date(jwt.exp * 1000) : 1,
            sameSite: "lax",
        });

        setState({
            token,
            user,
            role: jwt?.role ?? null,
            groupId: jwt?.group ?? null,
        });
        }

    function clearAuth() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        Cookies.remove("cer_token");
        setState({ token: null, user: null, role: null, groupId: null });
    }

  return (
    <AuthContext.Provider
      value={{ ...state, setAuth, clearAuth, isLoggedIn: !!state.token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}