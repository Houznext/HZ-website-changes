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

const USER_MANAGEMENT_EMAIL = "business@houznext.com";

interface PermissionStore {
  permissions: Permission[];
  memberships: BranchMembershipLite[];
  activeBranchId: string | null;
  userRole: string | null;
  userEmail: string | null;

  isLoading: boolean;
  initialized: boolean;
  fetchPermissions: (roleId: number) => Promise<void>;

  initFromSession: (
    memberships: BranchMembershipLite[],
    userRole?: string,
    userEmail?: string
  ) => void;

  /** @deprecated Use initFromSession instead */
  initFromMemberships: (memberships: BranchMembershipLite[]) => void;

  switchBranch: (branchId: string) => void;
  setPermissions: (permissions: Permission[]) => void;
  hasPermission: (resource: string, action?: keyof Permission) => boolean;
  isAdmin: () => boolean;
  /** Only business@houznext.com or users with user create permission can manage users */
  canManageUsers: () => boolean;
}

export const usePermissionStore = create<PermissionStore>((set, get) => ({
  permissions: [],
  memberships: [],
  activeBranchId: null,
  userRole: null,
  userEmail: null,
  isLoading: false,
  initialized: false,

  initFromSession: (memberships, userRole, userEmail) => {
    const flatPermissions: Permission[] = [];
    (memberships ?? []).forEach((m: any) => {
      (m.permissions ?? []).forEach((p: any) => {
        const existing = flatPermissions.find(
          (x) => x.resource === (p.resource ?? p.id)
        );
        if (!existing)
          flatPermissions.push({
            resource: p.resource ?? p.id,
            create: !!p.create,
            view: !!p.view,
            edit: !!p.edit,
            delete: !!p.delete,
          });
        else {
          existing.create = existing.create || !!p.create;
          existing.view = existing.view || !!p.view;
          existing.edit = existing.edit || !!p.edit;
          existing.delete = existing.delete || !!p.delete;
        }
      });
    });
    set({
      memberships: memberships ?? [],
      activeBranchId: null,
      permissions: flatPermissions,
      userRole: userRole ?? null,
      userEmail: userEmail ?? null,
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
    const { userEmail, permissions } = get();
    // User management: only business@houznext.com or explicit user permission
    if (resource?.toLowerCase() === "user") {
      if (userEmail === USER_MANAGEMENT_EMAIL) return true;
      const perm = permissions.find(
        (p) => p.resource?.toLowerCase() === "user"
      );
      if (!perm) return false;
      return !!(perm as any)[action];
    }
    // Other resources: use stored permissions if any, else allow (backward compat)
    if (permissions.length) {
      const perm = permissions.find(
        (p) => p.resource?.toLowerCase() === resource?.toLowerCase()
      );
      if (perm) return !!(perm as any)[action];
    }
    return true;
  },

  isAdmin: () => {
    const role = get().userRole;
    return role === "ADMIN" || role === "SuperAdmin";
  },

  canManageUsers: () => {
    const { userEmail, hasPermission } = get();
    return (
      userEmail === USER_MANAGEMENT_EMAIL ||
      hasPermission("user", "create") ||
      hasPermission("user", "edit")
    );
  },
}));
