import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyLead } from './property-lead.entity';
import { Property } from '../entities/property.entity';
import { PropertyLeadService } from './property-lead.service';
import { PropertyLeadController } from './property-lead.controller';
import { MailerService } from 'src/sendEmail.service';
import { SmsService } from 'src/sms.service';
import { NotificationService } from 'src/notifications/notification.service';
import { Notification } from 'src/notifications/entities/notification.entity';
 import { UserModule } from 'src/user/user.module';
 import { Project } from 'src/company-onboarding/entities/company-projects.entity';
 import { User } from 'src/user/entities/user.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyLead, Property,Notification,Project, User]), forwardRef(() => UserModule),
  ],
  controllers: [PropertyLeadController],
  providers: [PropertyLeadService, MailerService, SmsService,NotificationService],
})
export class PropertyLeadModule {}
