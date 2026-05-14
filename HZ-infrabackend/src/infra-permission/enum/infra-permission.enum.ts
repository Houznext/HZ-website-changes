export enum InfraPermissionResource {
  PROPERTY = 'property',
  PROPERTY_APPROVAL = 'property_approval',
  PROPERTY_MEDIA = 'property_media',
  PROJECT = 'project',
  PROJECT_MILESTONE = 'project_milestone',
  CRM_LEAD = 'crm_lead',
  ENQUIRY = 'enquiry',
  SITE_VISIT = 'site_visit',
  NEWS = 'news',
  HERO_CMS = 'hero_cms',
  RERA_DOCS = 'rera_docs',
  DEVELOPER_SUBMISSION = 'developer_submission',
  USER = 'user',
  ROLE = 'role',
  BRANCH = 'branch',
  PERMISSION = 'permission',
  SETTINGS = 'settings',
  AUDIT_LOG = 'audit_log',
}

export const getAllInfraResources = (): InfraPermissionResource[] =>
  Object.values(InfraPermissionResource);
