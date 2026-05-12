import { buildFullPermissions } from './infra-admin-resources';

export const STATIC_INFRA_ADMIN_EMAIL = 'business@houznext.com';
export const STATIC_INFRA_ADMIN_PASSWORD = 'Houznext@758';

export const HEADOFFICE_BRANCH_ID = 'branch_headoffice';
export const ROLE_SUPER_ID = 'role_super_admin';
export const INFRA_SUPER_ADMIN_USER_ID = 'user_super_001';

const base64url = (obj: unknown) =>
  Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

/** Same pattern as HZ-admin: client-readable payload; not verified by HZ-infrabackend. */
export function buildInfraStaticToken(): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = { exp: now + 60 * 60 * 24 * 30, lastLogin: now };
  const header = { alg: 'HS256', typ: 'JWT' };
  return `${base64url(header)}.${base64url(payload)}.houznext-infra-local`;
}

export function buildInfraSuperAdminUser() {
  const now = new Date().toISOString();
  const token = buildInfraStaticToken();
  const permissions = buildFullPermissions();

  return {
    id: INFRA_SUPER_ADMIN_USER_ID,
    email: STATIC_INFRA_ADMIN_EMAIL,
    firstName: 'Super',
    lastName: 'Admin',
    username: 'infra-super-admin',
    phone: null as string | null,
    profile: null as string | null,
    kind: 'STAFF',
    role: 'SuperAdmin',
    token,
    createdAt: now,
    updatedAt: now,
    branchMemberships: [
      {
        branchId: HEADOFFICE_BRANCH_ID,
        branchName: 'Headoffice',
        level: 'ORG',
        isBranchHead: true,
        isPrimary: true,
        branchRoles: [{ id: ROLE_SUPER_ID, roleName: 'Super Admin' }],
        permissions,
      },
    ],
  };
}
