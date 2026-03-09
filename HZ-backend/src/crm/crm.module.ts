import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CRMLead } from './entities/crm.entity';
import { LeadStatusLog } from './entities/leadStatus.entity';
import { CrmLeadController } from './crm.controller';
import { CrmLeadService } from './crm.service';
import { MailerService } from 'src/sendEmail.service';
import { NotificationService } from 'src/notifications/notification.service';
import { Notification } from 'src/notifications/entities/notification.entity';
import { UserModule } from 'src/user/user.module';
import { Branch } from 'src/branch/entities/branch.entity';
import { SmsService } from 'src/sms.service';
import { WhatsAppMsgService } from 'src/whatsApp.service';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CRMLead,
      LeadStatusLog,
      User,
      Notification,
      Branch,
    ]),
    forwardRef(() => UserModule),
  ],
  controllers: [CrmLeadController],
  providers: [CrmLeadService, MailerService, NotificationService, SmsService, WhatsAppMsgService],
  exports: [CrmLeadService],
})
export class CRMLeadModule {}
