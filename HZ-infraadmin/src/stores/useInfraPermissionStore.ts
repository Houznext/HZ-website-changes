import { create } from 'zustand';
import type { BranchMembership, Permission } from '@/types/infra-portal';
import { clearSession } from '@/lib/session';

const SUPER_ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_INFRA_SUPER_ADMIN_EMAIL || 'admin@infra.houznext.com';

interface InfraPermissionState {
  permissions: Permission[];
  branchMemberships: BranchMembership[];
  activeBranchId: string | null;
  userEmail: string;
  userRole: string;
  userKind: string;
  initialized: boolean;
  initFromSession: (memberships: BranchMembership[], role: string, email: string, kind: string) => void;
  hasPermission: (resource: string, action?: 'view' | 'create' | 'edit' | 'delete') => boolean;
  canManageUsers: () => boolean;
  signOut: () => void;
}

export const useInfraPermissionStore = create<InfraPermissionState>((set, get) => ({
  permissions: [],
  branchMemberships: [],
  activeBranchId: null,
  userEmail: '',
  userRole: '',
  userKind: '',
  initialized: false,

  initFromSession(memberships, role, email, kind) {
    const permissions = memberships.flatMap((m) => m.permissions ?? []);
    const activeBranchId =
      memberships.find((m) => m.isPrimary)?.branchId ?? memberships[0]?.branchId ?? null;
    set({
      permissions,
      branchMemberships: memberships,
      activeBranchId,
      userRole: role,
      userEmail: email,
      userKind: kind,
      initialized: true,
    });
  },

  hasPermission(resource, action = 'view') {
    const { userEmail, userRole, permissions } = get();
    if (userEmail === SUPER_ADMIN_EMAIL) return true;
    if (userRole === 'ADMIN' || userRole === 'admin') return true;
    if (!permissions.length) return true;
    const perm = permissions.find((p) => p.resource?.toLowerCase() === resource?.toLowerCase());
    if (!perm) return false;
    switch (action) {
      case 'view':
        return !!perm.view;
      case 'create':
        return !!perm.create;
      case 'edit':
        return !!perm.edit;
      case 'delete':
        return !!perm.delete;
      default:
        return false;
    }
  },

  canManageUsers() {
    return get().hasPermission('user', 'create');
  },

  signOut() {
    clearSession();
    if (typeof window !== 'undefined') window.location.href = '/login';
  },
}));
