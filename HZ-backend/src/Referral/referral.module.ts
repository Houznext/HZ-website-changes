import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Referral } from './entities/referral.entity';
import { ReferralController } from './referral.controller';
import { ReferralService } from './referral.service';
import { User } from 'src/user/entities/user.entity';
import { NotificationService } from 'src/notifications/notification.service';
import { MailerService } from 'src/sendEmail.service';
import { SmsService } from 'src/sms.service';
import { Notification } from 'src/notifications/entities/notification.entity';
import { WhatsAppMsgService } from 'src/whatsApp.service';

@Module({
  imports: [TypeOrmModule.forFeature([Referral, User,Notification])],
  controllers: [ReferralController],
  providers: [ReferralService, NotificationService,
    MailerService,
    WhatsAppMsgService,
    SmsService,],
})
export class ReferralModule {}
