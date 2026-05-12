/** RBAC resources for Houznext Infra admin (aligned with HZ-admin permission shape). */
export const INFRA_ADMIN_RESOURCES = [
  'listings',
  'pending',
  'projects',
  'crm',
  'siteVisits',
  'heroCms',
  'reraDocs',
  'developerSubmissions',
  'settings',
  'users',
  'branches',
  'roles',
] as const;

export type InfraAdminResource = (typeof INFRA_ADMIN_RESOURCES)[number];

export type InfraPermissionRow = {
  resource: string;
  create: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
};

export function buildFullPermissions(): InfraPermissionRow[] {
  return INFRA_ADMIN_RESOURCES.map((resource) => ({
    resource,
    create: true,
    view: true,
    edit: true,
    delete: true,
  }));
}

export function buildEmptyPermissions(): InfraPermissionRow[] {
  return INFRA_ADMIN_RESOURCES.map((resource) => ({
    resource,
    create: false,
    view: false,
    edit: false,
    delete: false,
  }));
}
