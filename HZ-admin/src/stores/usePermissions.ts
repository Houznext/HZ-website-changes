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
    if (!memberships || memberships.length === 0) {
      set({
        permissions: [],
        memberships: [],
        activeBranchId: null,
        userRole: userRole ?? null,
        initialized: true,
        isLoading: false,
      });
      return;
    }

    const primary = memberships.find((m) => m.isPrimary) ?? memberships[0];

    set({
      memberships,
      activeBranchId: primary.branchId,
      permissions: primary.permissions ?? [],
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
    const { memberships } = get();
    const membership = memberships.find((m) => m.branchId === branchId);
    if (!membership) return;

    set({
      activeBranchId: branchId,
      permissions: membership.permissions ?? [],
    });
  },

  setPermissions: (permissions) =>
    set({
      permissions,
      initialized: true,
      isLoading: false,
    }),

  hasPermission: (resource, action = "view") => {
    const { initialized, permissions, userRole } = get();
    if (!initialized) return false;
    if (userRole === "ADMIN") return true;

    return permissions.some(
      (perm) => perm.resource === resource && perm[action]
    );
  },

  isAdmin: () => get().userRole === "ADMIN",
}));
