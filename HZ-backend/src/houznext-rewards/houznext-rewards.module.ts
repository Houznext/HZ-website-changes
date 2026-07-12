import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Referral } from './entities/referral.entity';
import { User } from 'src/user/entities/user.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { HouznextRewardsController } from './referral.controller';
import { HouznextRewardsService } from './referral.service';
import { NotificationService } from 'src/notifications/notification.service';
import { MailerService } from 'src/sendEmail.service';
import { SmsService } from 'src/sms.service';
import { WhatsAppMsgService } from 'src/whatsApp.service';

@Module({
  imports: [TypeOrmModule.forFeature([Referral, User, Notification])],
  controllers: [HouznextRewardsController],
  providers: [
    HouznextRewardsService,
    NotificationService,
    MailerService,
    WhatsAppMsgService,
    SmsService,
  ],
  exports: [HouznextRewardsService],
})
export class HouznextRewardsModule {}
