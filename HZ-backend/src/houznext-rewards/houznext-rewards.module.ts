import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Referral } from './entities/referral.entity';
import { User } from 'src/user/entities/user.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { Property } from 'src/property/entities/property.entity';
import { PropertyLead } from 'src/property/propertyLead/property-lead.entity';
import { PropertyReferralAgreement } from './entities/propertyreferralagreement.entity';
import { ReferralCase } from './entities/referralcase.entity';
import { ReferralCaseStepLog } from './entities/referralcasesteplog.entity';
import { HouznextRewardsController } from './referral.controller';
import { HouznextRewardsService } from './referral.service';
import { ReferAndEarnAdminController } from './referandearn-admin.controller';
import { ReferAndEarnUserController } from './referandearn.controller';
import { HouznextRewardsPropertyService } from './referandearn.service';
import { NotificationService } from 'src/notifications/notification.service';
import { MailerService } from 'src/sendEmail.service';
import { SmsService } from 'src/sms.service';
import { WhatsAppMsgService } from 'src/whatsApp.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Referral,
      User,
      Notification,
      Property,
      PropertyReferralAgreement,
      ReferralCase,
      ReferralCaseStepLog,
      PropertyLead,
    ]),
  ],
  controllers: [
    HouznextRewardsController,
    ReferAndEarnAdminController,
    ReferAndEarnUserController,
  ],
  providers: [
    HouznextRewardsService,
    HouznextRewardsPropertyService,
    NotificationService,
    MailerService,
    WhatsAppMsgService,
    SmsService,
  ],
  exports: [HouznextRewardsService, HouznextRewardsPropertyService],
})
export class HouznextRewardsModule {}
