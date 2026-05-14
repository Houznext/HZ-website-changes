import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraCrmLead } from './entities/infra-crm-lead.entity';
import { InfraCrmActivity } from './entities/infra-crm-activity.entity';
import { InfraCrmSiteVisit } from './entities/infra-crm-site-visit.entity';
import { InfraProperty } from '../property/entities/infra-property.entity';
import { InfraUser } from '../infra-user/entities/infra-user.entity';
import { CrmLeadService } from './crm-lead.service';
import { CrmLeadController } from './crm-lead.controller';
import { CrmNotificationService } from './crm-notification.service';
import { InfraMailService } from '../common/mail/infra-mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([InfraCrmLead, InfraCrmActivity, InfraCrmSiteVisit, InfraProperty, InfraUser])],
  controllers: [CrmLeadController],
  providers: [CrmLeadService, CrmNotificationService, InfraMailService],
  exports: [CrmLeadService],
})
export class CrmLeadModule {}
