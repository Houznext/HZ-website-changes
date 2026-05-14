import { DataSourceOptions } from 'typeorm';
import { InfraCustomer } from '../customer/entities/infra-customer.entity';
import { InfraAdmin } from '../admin/entities/infra-admin.entity';
import { InfraOtp } from '../otp/entities/infra-otp.entity';
import { InfraProperty } from '../property/entities/infra-property.entity';
import { InfraPropertyMedia } from '../property/entities/infra-property-media.entity';
import { InfraPropertyDetails } from '../property/entities/infra-property-details.entity';
import { InfraProject } from '../project/entities/infra-project.entity';
import { InfraProjectMilestone } from '../project/entities/infra-project-milestone.entity';
import { InfraEnquiry } from '../enquiry/entities/infra-enquiry.entity';
import { InfraCRMLead } from '../crm/entities/infra-crm-lead.entity';
import { InfraSavedProperty } from '../saved/entities/infra-saved.entity';
import { InfraDeveloper } from '../developer/entities/infra-developer.entity';
import { InfraNews } from '../news/entities/infra-news.entity';
import { InfraSiteConfig } from '../site-config/entities/infra-site-config.entity';
import { InfraSiteVisit } from '../site-visit/entities/infra-site-visit.entity';
import { InfraUser } from '../infra-user/entities/infra-user.entity';
import { InfraUserBranchMembership } from '../infra-branch/entities/infra-user-branch-membership.entity';
import { InfraBranch } from '../infra-branch/entities/infra-branch.entity';
import { InfraBranchRole } from '../infra-branch-role/entities/infra-branch-role.entity';
import { InfraBranchRolePermission } from '../infra-branch-role-permission/entities/infra-branch-role-permission.entity';

export const infraEntities = [
  InfraCustomer,
  InfraAdmin,
  InfraOtp,
  InfraProperty,
  InfraPropertyMedia,
  InfraPropertyDetails,
  InfraProject,
  InfraProjectMilestone,
  InfraEnquiry,
  InfraCRMLead,
  InfraSavedProperty,
  InfraDeveloper,
  InfraNews,
  InfraSiteConfig,
  InfraSiteVisit,
  InfraUser,
  InfraUserBranchMembership,
  InfraBranch,
  InfraBranchRole,
  InfraBranchRolePermission,
];

export function buildTypeOrmOptions(): DataSourceOptions {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required');
  }
  const synchronize =
    process.env.TYPEORM_SYNC === 'true' ||
    (process.env.NODE_ENV !== 'production' && process.env.TYPEORM_SYNC !== 'false');

  return {
    type: 'postgres',
    url,
    entities: infraEntities,
    synchronize,
    logging: process.env.TYPEORM_LOGGING === 'true',
  };
}
