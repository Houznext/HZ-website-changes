import { create } from "zustand";
import type { BranchMembership } from "@/types/next-auth";

export type SessionUser = {
  id: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profile?: string;
  token: string;
  kind?: string;
  role?: string;
  activeBranchId?: string;
  branchMemberships?: BranchMembership[];
  [key: string]: unknown;
};

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type SessionStore = {
  status: SessionStatus;
  token: string | null;
  user: SessionUser | null;
  lastLogin?: number;
  setSession: (data: {
    status: SessionStatus;
    token?: string | null;
    user?: SessionUser | null;
    lastLogin?: number;
  }) => void;
  clearSession: () => void;
};

const initialState = {
  status: "loading" as SessionStatus,
  token: null as string | null,
  user: null as SessionUser | null,
  lastLogin: undefined as number | undefined,
};

export const useSessionStore = create<SessionStore>((set) => ({
  ...initialState,

  setSession: (data) =>
    set({
      status: data.status,
      token: data.token ?? null,
      user: data.user ?? null,
      lastLogin: data.lastLogin,
    }),

  clearSession: () => set(initialState),
}));

/**
 * Get token from Zustand store (no NextAuth getSession call).
 * Use this in apiClient so we don't trigger /api/auth/session on every request.
 */
export function getTokenFromStore(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return useSessionStore.getState().token;
  } catch {
    return null;
  }
}
