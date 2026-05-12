import { create } from 'zustand';
import type { InfraPermissionRow } from '@/lib/infra-admin-resources';

export type InfraBranchMembershipLite = {
  branchId: string;
  branchName: string;
  level: string;
  isBranchHead: boolean;
  isPrimary: boolean;
  branchRoles: { id: string; roleName: string }[];
  permissions: InfraPermissionRow[];
};

type InfraPermState = {
  branchMemberships: InfraBranchMembershipLite[];
  userRole: string | null;
  userEmail: string | null;
  initFromSession: (
    memberships: InfraBranchMembershipLite[] | undefined,
    role: string | null | undefined,
    email: string | null | undefined,
  ) => void;
  clear: () => void;
  hasPermission: (resource: string, action: 'create' | 'view' | 'edit' | 'delete') => boolean;
  isAdmin: () => boolean;
  canManageUsers: () => boolean;
};

export const useInfraPermissionStore = create<InfraPermState>((set, get) => ({
  branchMemberships: [],
  userRole: null,
  userEmail: null,

  initFromSession: (memberships, role, email) =>
    set({
      branchMemberships: memberships ?? [],
      userRole: role ?? null,
      userEmail: email ?? null,
    }),

  clear: () =>
    set({
      branchMemberships: [],
      userRole: null,
      userEmail: null,
    }),

  hasPermission: (resource, action) => {
    const { branchMemberships } = get();
    return branchMemberships.some((m) =>
      m.permissions.some((p) => p.resource === resource && p[action]),
    );
  },

  isAdmin: () => {
    const r = get().userRole;
    return r === 'SuperAdmin' || r === 'Admin';
  },

  canManageUsers: () => {
    const s = get();
    if (s.isAdmin()) return true;
    return s.hasPermission('users', 'view') && s.hasPermission('users', 'edit');
  },
}));
