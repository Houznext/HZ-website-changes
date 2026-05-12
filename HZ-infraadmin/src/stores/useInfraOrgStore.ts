import { create } from 'zustand';
import type { InfraOrgBranch, InfraOrgRole, InfraOrgUser } from '@/types/infra-admin-org.types';
import {
  HEADOFFICE_BRANCH_ID,
  INFRA_SUPER_ADMIN_USER_ID,
  ROLE_SUPER_ID,
  STATIC_INFRA_ADMIN_EMAIL,
  STATIC_INFRA_ADMIN_PASSWORD,
} from '@/lib/infra-admin-static-session';
import { buildFullPermissions } from '@/lib/infra-admin-resources';

export type { InfraOrgBranch, InfraOrgRole, InfraOrgUser } from '@/types/infra-admin-org.types';
export { ROLE_SUPER_ID };

const now = () => new Date().toISOString();

const seedBranches: InfraOrgBranch[] = [
  {
    id: HEADOFFICE_BRANCH_ID,
    name: 'Headoffice',
    code: 'HO',
    createdAt: now(),
  },
];

const seedRoles: InfraOrgRole[] = [
  {
    id: ROLE_SUPER_ID,
    name: 'Super Admin',
    description: 'Full access to all modules and settings.',
    permissions: buildFullPermissions(),
    createdAt: now(),
  },
];

const seedUsers: InfraOrgUser[] = [
  {
    id: INFRA_SUPER_ADMIN_USER_ID,
    email: STATIC_INFRA_ADMIN_EMAIL,
    firstName: 'Super',
    lastName: 'Admin',
    branchId: HEADOFFICE_BRANCH_ID,
    roleIds: [ROLE_SUPER_ID],
    isActive: true,
    createdAt: now(),
  },
];

function mergeWithSeeds(branches: InfraOrgBranch[], roles: InfraOrgRole[], users: InfraOrgUser[]) {
  let b = [...branches];
  if (!b.some((x) => x.id === HEADOFFICE_BRANCH_ID)) b = [seedBranches[0], ...b];
  let r = [...roles];
  if (!r.some((x) => x.id === ROLE_SUPER_ID)) r = [seedRoles[0], ...r];
  let u = [...users];
  if (!u.some((x) => x.email.toLowerCase() === STATIC_INFRA_ADMIN_EMAIL.toLowerCase())) {
    u = [seedUsers[0], ...u];
  }
  return { branches: b, roles: r, users: u };
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;

async function pushSnapshot(
  branches: InfraOrgBranch[],
  roles: InfraOrgRole[],
  users: InfraOrgUser[],
  userPasswords?: Record<string, string>,
) {
  const res = await fetch('/api/infra-admin/org', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ branches, roles, users, userPasswords }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || res.statusText);
  }
  return (await res.json()) as {
    branches: InfraOrgBranch[];
    roles: InfraOrgRole[];
    users: InfraOrgUser[];
    loginReady: Record<string, boolean>;
  };
}

type InfraOrgState = {
  branches: InfraOrgBranch[];
  roles: InfraOrgRole[];
  users: InfraOrgUser[];
  loginReady: Record<string, boolean>;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  flushNow: (userPasswords?: Record<string, string>) => Promise<void>;
  schedulePersist: () => void;
  upsertBranch: (b: Omit<InfraOrgBranch, 'createdAt'> & { createdAt?: string }) => void;
  removeBranch: (id: string) => void;
  upsertRole: (r: Omit<InfraOrgRole, 'createdAt'> & { createdAt?: string }) => void;
  removeRole: (id: string) => void;
  upsertUser: (u: Omit<InfraOrgUser, 'createdAt'> & { createdAt?: string }, opts?: { skipPersist?: boolean }) => void;
  removeUser: (id: string) => void;
  resetSeed: () => void;
};

export const useInfraOrgStore = create<InfraOrgState>((set, get) => ({
  branches: seedBranches,
  roles: seedRoles,
  users: seedUsers,
  loginReady: {},
  hydrated: false,

  hydrate: async () => {
    try {
      const res = await fetch('/api/infra-admin/org', { credentials: 'include' });
      if (res.status === 401) {
        set({ hydrated: true });
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as {
        branches: InfraOrgBranch[];
        roles: InfraOrgRole[];
        users: InfraOrgUser[];
        loginReady?: Record<string, boolean>;
      };
      set({
        branches: data.branches,
        roles: data.roles,
        users: data.users,
        loginReady: data.loginReady ?? {},
        hydrated: true,
      });
    } catch (e) {
      console.error('[useInfraOrgStore.hydrate]', e);
      set({ hydrated: true });
    }
  },

  flushNow: async (userPasswords) => {
    if (persistTimer) {
      clearTimeout(persistTimer);
      persistTimer = null;
    }
    const { branches, roles, users } = get();
    const merged = mergeWithSeeds(branches, roles, users);
    const data = await pushSnapshot(merged.branches, merged.roles, merged.users, userPasswords);
    set({
      branches: data.branches,
      roles: data.roles,
      users: data.users,
      loginReady: data.loginReady ?? {},
    });
  },

  schedulePersist: () => {
    if (typeof window === 'undefined') return;
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
      persistTimer = null;
      const { branches, roles, users } = useInfraOrgStore.getState();
      const merged = mergeWithSeeds(branches, roles, users);
      void pushSnapshot(merged.branches, merged.roles, merged.users)
        .then((data) => {
          useInfraOrgStore.setState({
            branches: data.branches,
            roles: data.roles,
            users: data.users,
            loginReady: data.loginReady ?? {},
          });
        })
        .catch((e) => console.error('[useInfraOrgStore.persist]', e));
    }, 450);
  },

  upsertBranch: (b) => {
    set((s) => {
      const prev = s.branches.find((x) => x.id === b.id);
      const row: InfraOrgBranch = {
        id: b.id,
        name: b.name,
        code: b.code,
        createdAt: b.createdAt ?? prev?.createdAt ?? now(),
      };
      return { branches: [...s.branches.filter((x) => x.id !== b.id), row] };
    });
    get().schedulePersist();
  },

  removeBranch: (id) => {
    if (id === HEADOFFICE_BRANCH_ID) return;
    set((s) => ({
      branches: s.branches.filter((b) => b.id !== id),
      users: s.users.map((u) =>
        u.branchId === id ? { ...u, branchId: HEADOFFICE_BRANCH_ID } : u,
      ),
    }));
    get().schedulePersist();
  },

  upsertRole: (r) => {
    set((s) => {
      const prev = s.roles.find((x) => x.id === r.id);
      const row: InfraOrgRole = {
        id: r.id,
        name: r.name,
        description: r.description,
        permissions: r.permissions,
        createdAt: r.createdAt ?? prev?.createdAt ?? now(),
      };
      return { roles: [...s.roles.filter((x) => x.id !== r.id), row] };
    });
    get().schedulePersist();
  },

  removeRole: (id) => {
    if (id === ROLE_SUPER_ID) return;
    set((s) => ({
      roles: s.roles.filter((r) => r.id !== id),
      users: s.users.map((u) => ({
        ...u,
        roleIds: u.roleIds.filter((rid) => rid !== id),
      })),
    }));
    get().schedulePersist();
  },

  upsertUser: (u, opts) => {
    set((s) => {
      const prev = s.users.find((x) => x.id === u.id);
      const row: InfraOrgUser = {
        id: u.id,
        email: u.email.trim(),
        firstName: u.firstName,
        lastName: u.lastName,
        branchId: u.branchId,
        roleIds: u.roleIds,
        isActive: u.isActive,
        createdAt: u.createdAt ?? prev?.createdAt ?? now(),
      };
      return { users: [...s.users.filter((x) => x.id !== u.id), row] };
    });
    if (!opts?.skipPersist) get().schedulePersist();
  },

  removeUser: (id) => {
    const u = get().users.find((x) => x.id === id);
    if (u?.email.toLowerCase() === STATIC_INFRA_ADMIN_EMAIL.toLowerCase()) return;
    set((s) => ({ users: s.users.filter((x) => x.id !== id) }));
    get().schedulePersist();
  },

  resetSeed: () => {
    set({
      branches: seedBranches,
      roles: seedRoles,
      users: seedUsers,
      loginReady: {},
    });
    void get().flushNow({ [INFRA_SUPER_ADMIN_USER_ID]: STATIC_INFRA_ADMIN_PASSWORD });
  },
}));
