import type { DefaultSession } from 'next-auth';
import type { InfraPermissionRow } from '@/lib/infra-admin-resources';

export type InfraSessionBranchMembership = {
  branchId: string;
  branchName: string;
  level: string;
  isBranchHead: boolean;
  isPrimary: boolean;
  branchRoles: { id: string; roleName: string }[];
  permissions: InfraPermissionRow[];
};

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
    token?: string;
    branchMemberships?: InfraSessionBranchMembership[];
    lastLogin?: number;
    error?: string;
    user?: (DefaultSession['user'] & {
      id: string;
      role?: string;
      kind?: string;
      username?: string;
      firstName?: string;
      lastName?: string;
      branchMemberships?: InfraSessionBranchMembership[];
    }) | null;
  }

  interface User {
    role?: string;
    accessToken?: string;
    token?: string;
    branchMemberships?: InfraSessionBranchMembership[];
    firstName?: string;
    lastName?: string;
    username?: string;
    kind?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      username: string;
      phone: string | null;
      profile: string | null;
      kind: string;
      role: string;
      token: string;
      createdAt: string;
      updatedAt: string;
      branchMemberships: InfraSessionBranchMembership[];
    };
    lastLogin?: number;
  }
}
