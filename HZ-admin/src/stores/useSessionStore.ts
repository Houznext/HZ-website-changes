import { create } from "zustand";

export type SessionUser = {
  id: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profile?: string;
  token: string;
  role?: string;
  kind?: string;
  branchMemberships?: Array<{
    branchId: string;
    branchName?: string;
    branchRoles?: Array<{ id: string; roleName: string }>;
    permissions?: unknown[];
  }>;
  [key: string]: unknown;
};

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type SessionStore = {
  status: SessionStatus;
  token: string | null;
  user: SessionUser | null;
  branchMembership: unknown[];
  lastLogin?: number;
  /** Set from NextAuth session (called by SessionSync) */
  setSession: (data: {
    status: SessionStatus;
    token?: string | null;
    user?: SessionUser | null;
    branchMembership?: unknown[];
    lastLogin?: number;
  }) => void;
  clearSession: () => void;
};

const initialState = {
  status: "loading" as SessionStatus,
  token: null as string | null,
  user: null as SessionUser | null,
  branchMembership: [] as unknown[],
  lastLogin: undefined as number | undefined,
};

export const useSessionStore = create<SessionStore>((set) => ({
  ...initialState,

  setSession: (data) =>
    set({
      status: data.status,
      token: data.token ?? null,
      user: data.user ?? null,
      branchMembership: data.branchMembership ?? [],
      lastLogin: data.lastLogin,
    }),

  clearSession: () => set(initialState),
}));
