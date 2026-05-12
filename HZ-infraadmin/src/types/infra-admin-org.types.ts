import type { InfraPermissionRow } from '@/lib/infra-admin-resources';

export type InfraOrgBranch = {
  id: string;
  name: string;
  code?: string;
  createdAt: string;
};

export type InfraOrgRole = {
  id: string;
  name: string;
  description?: string;
  permissions: InfraPermissionRow[];
  createdAt: string;
};

export type InfraOrgUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  branchId: string;
  roleIds: string[];
  isActive: boolean;
  createdAt: string;
};

/** Stored on disk only — never sent to the client. */
export type InfraOrgPersistedAccount = InfraOrgUser & { passwordHash: string };

export type InfraOrgStoreFile = {
  version: 1;
  branches: InfraOrgBranch[];
  roles: InfraOrgRole[];
  accounts: InfraOrgPersistedAccount[];
};
