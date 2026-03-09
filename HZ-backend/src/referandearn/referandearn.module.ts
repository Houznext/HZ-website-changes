import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Property } from 'src/property/entities/property.entity';
import { User } from 'src/user/entities/user.entity';
import { PropertyLead } from 'src/property/propertyLead/property-lead.entity';

import { PropertyReferralAgreement } from './entities/propertyreferralagreement.entity';
import { ReferralCase } from './entities/referralcase.entity';
import { ReferralCaseStepLog } from './entities/referralcasesteplog.entity';
import { ReferAndEarnAdminController } from './referandearn-admin.controller';
import {ReferAndEarnUserController} from "./referandearn.controller"
import { ReferAndEarnService } from './referandearn.service';
import { NotificationService } from 'src/notifications/notification.service';
import { MailerService } from 'src/sendEmail.service';
import { Notification } from 'src/notifications/entities/notification.entity';
import { SmsService } from 'src/sms.service';
import { WhatsAppMsgService } from 'src/whatsApp.service';
@Module({

  imports: [
    TypeOrmModule.forFeature([
      Property,
      User,
      PropertyReferralAgreement,
      ReferralCase,
      ReferralCaseStepLog,
      PropertyLead,
      Notification,
    ]),
  ],
  controllers: [ReferAndEarnAdminController, ReferAndEarnUserController],
  providers: [ReferAndEarnService, NotificationService,
    MailerService,
    SmsService,WhatsAppMsgService,],
  exports: [ReferAndEarnService],
})
export class ReferAndEarnModule {}
