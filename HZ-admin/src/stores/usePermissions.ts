import { create } from "zustand";
import apiClient from "@/src/utils/apiClient";

export interface Permission {
  resource: string;
  create: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
}

export interface BranchMembershipLite {
  // Legacy shape kept for compatibility with existing session payloads,
  // but branch-based behaviour is no longer used.
  branchId: string;
  branchName?: string;
  level?: string;
  isPrimary?: boolean;
  isBranchHead?: boolean;
  permissions?: Permission[];
}

interface PermissionStore {
  permissions: Permission[];
  memberships: BranchMembershipLite[];
  activeBranchId: string | null;
  userRole: string | null;

  isLoading: boolean;
  initialized: boolean;
  fetchPermissions: (roleId: number) => Promise<void>;

  initFromSession: (
    memberships: BranchMembershipLite[],
    userRole?: string
  ) => void;

  /** @deprecated Use initFromSession instead */
  initFromMemberships: (memberships: BranchMembershipLite[]) => void;

  switchBranch: (branchId: string) => void;
  setPermissions: (permissions: Permission[]) => void;
  hasPermission: (resource: string, action?: keyof Permission) => boolean;
  isAdmin: () => boolean;
}

export const usePermissionStore = create<PermissionStore>((set, get) => ({
  permissions: [],
  memberships: [],
  activeBranchId: null,
  userRole: null,
  isLoading: false,
  initialized: false,

  initFromSession: (memberships, userRole) => {
    set({
      // Branch memberships are no longer used for permission decisions
      memberships: memberships ?? [],
      activeBranchId: null,
      permissions: [],
      userRole: userRole ?? null,
      initialized: true,
      isLoading: false,
    });
  },

  initFromMemberships: (memberships) => {
    get().initFromSession(memberships, get().userRole ?? undefined);
  },

  fetchPermissions: async (roleId) => {
    const response = await apiClient.get(`/roles/${roleId}`);
    const role = response.body;
    set({ permissions: role.permissions });
  },

  switchBranch: (branchId) => {
    // Branch switching is no-op now that branches are removed
    set({ activeBranchId: null });
  },

  setPermissions: (permissions) =>
    set({
      permissions,
      initialized: true,
      isLoading: false,
    }),

  hasPermission: (resource, action = "view") => {
    // Branch/role-based permissions have been simplified away.
    // All checks now return true so existing UI continues to work.
    resource;
    action;
    return true;
  },

  isAdmin: () => {
    const role = get().userRole;
    return role === "ADMIN" || role === "SuperAdmin";
  },
}));
