// src/stores/useAuthBranchStore.ts
import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

// ---- Types ----
export type Branch = { 
  id: string; 
  name: string; 
  parentBranchId?: string | null;
  level?: string;
  category?: "GENERAL" | "CUSTOM_BUILDER" | "INTERIORS";
  isHeadOffice?: boolean;
  isStateHQ?: boolean;
  hasFranchiseFeePaid?: boolean;
  franchisePaymentRef?: string;
};
export type Permission = { resource: string; view: boolean; create: boolean; edit: boolean; delete: boolean };
export type BranchRole = {
    id: string;
  branchId: string;
  branchName: string;
  roleName: string;
  isBranchHead?: boolean;
  permissions: Permission[];
};
export type MeResponse = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  branchRoles: BranchRole[];
  branches: Branch[];
  defaultBranch?: Branch | null;
};

type State = {
  // auth
  token: string | null;
  me: MeResponse | null;
  isLoadingMe: boolean;

  // branch
  branches: Branch[];
  activeBranchId: string | null;

  // actions
  setToken: (t: string | null) => void;
  bootstrapMe: (apiBase?: string) => Promise<void>;
  setActiveBranch: (id: string) => void;

  // helpers
  getActiveBranch: () => Branch | null;
  can: (resource: string, action: keyof Permission) => boolean;
};

// ---- Store ----
export const useAuthBranchStore = create<State>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        token: null,
        me: null,
        isLoadingMe: false,

        branches: [],
        activeBranchId: null,

        setToken: (t) => set({ token: t }),

        bootstrapMe: async (apiBase = process.env.NEXT_PUBLIC_API_BASE || "/api") => {
          const token = get().token;
          if (!token) {
            set({ me: null, branches: [], activeBranchId: null, isLoadingMe: false });
            return;
          }
          try {
            set({ isLoadingMe: true });
            const res = await fetch(`${apiBase}/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(await res.text());
            const data: MeResponse = await res.json();

            // Choose active branch: keep current if still valid, else default, else first
            const current = get().activeBranchId;
            const stillValid = current && data.branches.some((b) => b.id === current);
            const nextActive =
              (stillValid && current) ||
              data.defaultBranch?.id ||
              data.branches[0]?.id ||
              null;

            set({
              me: data,
              branches: data.branches || [],
              activeBranchId: nextActive,
              isLoadingMe: false,
            });
          } catch {
            set({ isLoadingMe: false });
          }
        },

        setActiveBranch: (id) => {
          const ok = get().branches.some((b) => b.id === id);
          if (!ok) return;
          set({ activeBranchId: id });
        },

        getActiveBranch: () => {
          const { branches, activeBranchId } = get();
          return branches.find((b) => b.id === activeBranchId) || null;
        },

        can: (resource, action) => {
          const { me, activeBranchId } = get();
          if (!me || !activeBranchId) return false;
          const role = me.branchRoles.find((r) => r.branchId === activeBranchId);
          const perm = role?.permissions.find((p) => p.resource === resource);
          return Boolean(perm && perm[action]);
        },
      }),
      {
        name: "oc_auth_branch_v1",          // localStorage key
        partialize: (s) => ({
          token: s.token,
          activeBranchId: s.activeBranchId,
          // me/branches are refetched on load → optional to persist
        }),
      }
    )
  )
);
