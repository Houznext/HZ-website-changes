import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import type { User } from 'next-auth';
import type {
  InfraOrgBranch,
  InfraOrgPersistedAccount,
  InfraOrgRole,
  InfraOrgStoreFile,
  InfraOrgUser,
} from '@/types/infra-admin-org.types';
import {
  HEADOFFICE_BRANCH_ID,
  INFRA_SUPER_ADMIN_USER_ID,
  ROLE_SUPER_ID,
  STATIC_INFRA_ADMIN_EMAIL,
  STATIC_INFRA_ADMIN_PASSWORD,
  buildInfraStaticToken,
} from '@/lib/infra-admin-static-session';
import { buildFullPermissions, INFRA_ADMIN_RESOURCES, type InfraPermissionRow } from '@/lib/infra-admin-resources';
import type { InfraSessionBranchMembership } from '@/types/next-auth';

const STORE_VERSION = 1 as const;

function nowIso() {
  return new Date().toISOString();
}

function storePath() {
  return path.join(process.cwd(), 'data', 'infra-admin-org.json');
}

function defaultBranches(): InfraOrgBranch[] {
  return [
    {
      id: HEADOFFICE_BRANCH_ID,
      name: 'Headoffice',
      code: 'HO',
      createdAt: nowIso(),
    },
  ];
}

function defaultRoles(): InfraOrgRole[] {
  return [
    {
      id: ROLE_SUPER_ID,
      name: 'Super Admin',
      description: 'Full access to all modules and settings.',
      permissions: buildFullPermissions(),
      createdAt: nowIso(),
    },
  ];
}

function defaultSuperAccount(): InfraOrgPersistedAccount {
  return {
    id: INFRA_SUPER_ADMIN_USER_ID,
    email: STATIC_INFRA_ADMIN_EMAIL,
    firstName: 'Super',
    lastName: 'Admin',
    branchId: HEADOFFICE_BRANCH_ID,
    roleIds: [ROLE_SUPER_ID],
    isActive: true,
    createdAt: nowIso(),
    passwordHash: bcrypt.hashSync(STATIC_INFRA_ADMIN_PASSWORD, 10),
  };
}

function defaultStore(): InfraOrgStoreFile {
  return {
    version: STORE_VERSION,
    branches: defaultBranches(),
    roles: defaultRoles(),
    accounts: [defaultSuperAccount()],
  };
}

function ensureDir() {
  const dir = path.dirname(storePath());
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function readInfraOrgStore(): InfraOrgStoreFile {
  ensureDir();
  const p = storePath();
  if (!fs.existsSync(p)) {
    const initial = defaultStore();
    writeInfraOrgStore(initial);
    return initial;
  }
  try {
    const raw = fs.readFileSync(p, 'utf8');
    const parsed = JSON.parse(raw) as Partial<InfraOrgStoreFile>;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.accounts)) {
      const initial = defaultStore();
      writeInfraOrgStore(initial);
      return initial;
    }
    return parsed as InfraOrgStoreFile;
  } catch {
    const initial = defaultStore();
    writeInfraOrgStore(initial);
    return initial;
  }
}

export function writeInfraOrgStore(data: InfraOrgStoreFile) {
  ensureDir();
  const p = storePath();
  const tmp = `${p}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, p);
}

function mergeOrgSeeds(branches: InfraOrgBranch[], roles: InfraOrgRole[], users: InfraOrgUser[]) {
  let b = [...branches];
  if (!b.some((x) => x.id === HEADOFFICE_BRANCH_ID)) b = [defaultBranches()[0], ...b];
  let r = [...roles];
  if (!r.some((x) => x.id === ROLE_SUPER_ID)) r = [defaultRoles()[0], ...r];
  let u = [...users];
  if (!u.some((x) => x.email.toLowerCase() === STATIC_INFRA_ADMIN_EMAIL.toLowerCase())) {
    u = [
      {
        id: INFRA_SUPER_ADMIN_USER_ID,
        email: STATIC_INFRA_ADMIN_EMAIL,
        firstName: 'Super',
        lastName: 'Admin',
        branchId: HEADOFFICE_BRANCH_ID,
        roleIds: [ROLE_SUPER_ID],
        isActive: true,
        createdAt: nowIso(),
      },
      ...u,
    ];
  }
  return { branches: b, roles: r, users: u };
}

function mergeRolePermissions(roleIds: string[], roles: InfraOrgRole[]): InfraPermissionRow[] {
  const map = new Map<string, InfraPermissionRow>();
  for (const resource of INFRA_ADMIN_RESOURCES) {
    map.set(resource, { resource, create: false, view: false, edit: false, delete: false });
  }
  for (const rid of roleIds) {
    const role = roles.find((x) => x.id === rid);
    if (!role) continue;
    for (const p of role.permissions) {
      const cur = map.get(p.resource);
      if (!cur) continue;
      cur.create = cur.create || p.create;
      cur.view = cur.view || p.view;
      cur.edit = cur.edit || p.edit;
      cur.delete = cur.delete || p.delete;
    }
  }
  return Array.from(map.values());
}

export function buildBranchMembershipsForAccount(
  account: InfraOrgUser,
  branches: InfraOrgBranch[],
  roles: InfraOrgRole[],
): InfraSessionBranchMembership[] {
  const branch = branches.find((b) => b.id === account.branchId);
  const branchName = branch?.name ?? account.branchId;
  const branchRoles = account.roleIds
    .map((id) => {
      const r = roles.find((x) => x.id === id);
      return r ? { id: r.id, roleName: r.name } : null;
    })
    .filter((x): x is { id: string; roleName: string } => !!x);

  const permissions = mergeRolePermissions(account.roleIds, roles);

  return [
    {
      branchId: account.branchId,
      branchName,
      level: 'ORG',
      isBranchHead: account.roleIds.includes(ROLE_SUPER_ID),
      isPrimary: true,
      branchRoles,
      permissions,
    },
  ];
}

export function buildNextAuthUserFromAccount(account: InfraOrgPersistedAccount, store: InfraOrgStoreFile): User {
  const { branches, roles } = store;
  const isSuper = account.roleIds.includes(ROLE_SUPER_ID);
  const token = buildInfraStaticToken();
  const t = nowIso();
  const memberships = buildBranchMembershipsForAccount(account, branches, roles);

  return {
    id: account.id,
    email: account.email,
    name: `${account.firstName} ${account.lastName}`.trim(),
    firstName: account.firstName,
    lastName: account.lastName,
    username: account.email.split('@')[0] || account.id,
    phone: null,
    profile: null,
    kind: 'STAFF',
    role: isSuper ? 'SuperAdmin' : 'Staff',
    token,
    createdAt: account.createdAt,
    updatedAt: t,
    branchMemberships: memberships,
  } as User;
}

export function verifyInfraAdminCredentials(email: string, password: string): User | null {
  const store = readInfraOrgStore();
  const acc = store.accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!acc || !acc.isActive) return null;
  if (!acc.passwordHash || !bcrypt.compareSync(password, acc.passwordHash)) return null;
  return buildNextAuthUserFromAccount(acc, store);
}

export function listPublicUsers(store: InfraOrgStoreFile): InfraOrgUser[] {
  return store.accounts.map(({ passwordHash: _h, ...u }) => u);
}

/**
 * Applies a full org snapshot from an authenticated admin. Merges password hashes;
 * `userPasswords` supplies plaintext only for creates or password changes.
 */
export function applyOrgSnapshotPut(
  current: InfraOrgStoreFile,
  body: {
    branches: InfraOrgBranch[];
    roles: InfraOrgRole[];
    users: InfraOrgUser[];
    userPasswords?: Record<string, string>;
  },
): InfraOrgStoreFile {
  const merged = mergeOrgSeeds(body.branches, body.roles, body.users);
  const prevById = new Map(current.accounts.map((a) => [a.id, a]));

  const accounts: InfraOrgPersistedAccount[] = merged.users.map((u) => {
    const prev = prevById.get(u.id);
    const plain = body.userPasswords?.[u.id];
    let passwordHash = prev?.passwordHash ?? '';
    if (plain !== undefined && plain.trim() !== '') {
      passwordHash = bcrypt.hashSync(plain.trim(), 10);
    }
    if (!prev && (!passwordHash || passwordHash === '')) {
      throw new Error(`NEW_USER_NEEDS_PASSWORD:${u.email}`);
    }
    return { ...u, passwordHash: passwordHash || prev?.passwordHash || '' };
  });

  return {
    version: STORE_VERSION,
    branches: merged.branches,
    roles: merged.roles,
    accounts,
  };
}

/**
 * Merges org data from the old browser zustand persist (`hz-infraadmin-org`) into the file store.
 * Existing server password hashes are kept when users match by id or email; new users from legacy
 * get an empty hash until an admin sets a password in Users.
 */
export function mergeLegacyBrowserOrg(
  current: InfraOrgStoreFile,
  legacy: { branches: InfraOrgBranch[]; roles: InfraOrgRole[]; users: InfraOrgUser[] },
): InfraOrgStoreFile {
  const bMap = new Map(current.branches.map((b) => [b.id, { ...b }]));
  for (const lb of legacy.branches) {
    const ex = bMap.get(lb.id);
    bMap.set(lb.id, {
      ...(ex ?? { id: lb.id, name: lb.name, createdAt: nowIso() }),
      ...lb,
      id: lb.id,
      createdAt: lb.createdAt ?? ex?.createdAt ?? nowIso(),
    });
  }

  const rMap = new Map(current.roles.map((r) => [r.id, { ...r }]));
  for (const lr of legacy.roles) {
    const ex = rMap.get(lr.id);
    rMap.set(lr.id, {
      ...(ex ?? { id: lr.id, name: lr.name, permissions: lr.permissions, createdAt: nowIso() }),
      ...lr,
      id: lr.id,
      createdAt: lr.createdAt ?? ex?.createdAt ?? nowIso(),
    });
  }

  const aMap = new Map(current.accounts.map((a) => [a.id, { ...a }]));
  const emailToId = new Map(current.accounts.map((a) => [a.email.toLowerCase(), a.id]));

  for (const lu of legacy.users) {
    const emailLc = lu.email.trim().toLowerCase();
    let ex = aMap.get(lu.id);
    if (!ex) {
      const altId = emailToId.get(emailLc);
      if (altId) ex = aMap.get(altId);
    }
    if (ex) {
      aMap.set(ex.id, {
        ...ex,
        ...lu,
        id: ex.id,
        email: lu.email.trim(),
        passwordHash: ex.passwordHash || '',
        createdAt: lu.createdAt ?? ex.createdAt,
      });
      emailToId.set(ex.email.toLowerCase(), ex.id);
      emailToId.set(emailLc, ex.id);
    } else {
      aMap.set(lu.id, {
        ...lu,
        email: lu.email.trim(),
        passwordHash: '',
      });
      emailToId.set(emailLc, lu.id);
    }
  }

  let branches = Array.from(bMap.values());
  let roles = Array.from(rMap.values());
  let accounts = Array.from(aMap.values());

  if (!branches.some((b) => b.id === HEADOFFICE_BRANCH_ID)) {
    branches = [defaultBranches()[0], ...branches];
  }
  if (!roles.some((r) => r.id === ROLE_SUPER_ID)) {
    roles = [defaultRoles()[0], ...roles];
  }

  const hasSuperEmail = accounts.some(
    (a) => a.email.toLowerCase() === STATIC_INFRA_ADMIN_EMAIL.toLowerCase(),
  );
  if (!hasSuperEmail) {
    accounts = [defaultSuperAccount(), ...accounts];
  } else {
    accounts = accounts.map((a) => {
      if (a.email.toLowerCase() !== STATIC_INFRA_ADMIN_EMAIL.toLowerCase()) return a;
      let passwordHash = a.passwordHash;
      if (!passwordHash || passwordHash.length < 15) {
        passwordHash = bcrypt.hashSync(STATIC_INFRA_ADMIN_PASSWORD, 10);
      }
      const roleIds = a.roleIds.includes(ROLE_SUPER_ID) ? a.roleIds : [...a.roleIds, ROLE_SUPER_ID];
      return {
        ...a,
        passwordHash,
        roleIds,
        branchId: a.branchId || HEADOFFICE_BRANCH_ID,
      };
    });
  }

  return {
    version: STORE_VERSION,
    branches,
    roles,
    accounts,
  };
}
