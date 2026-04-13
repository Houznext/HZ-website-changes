import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyProgress } from './entities/daily-progress.entity';
import { CustomBuilder } from '../entities/custom-builder.entity';
import { DailyProgressController } from './daily-progress.controller';
import { DailyProgressService } from './daily-progress.service';
import { NotificationService } from 'src/notifications/notification.service';
import { MailerService } from 'src/sendEmail.service';
import { SmsService } from 'src/sms.service';
import { Notification } from 'src/notifications/entities/notification.entity';
import { WhatsAppMsgService } from 'src/whatsApp.service';
 import { UserModule } from 'src/user/user.module';
 import { User } from 'src/user/entities/user.entity';
 

@Module({
  imports: [TypeOrmModule.forFeature([DailyProgress, CustomBuilder,User, Notification]),forwardRef(() => UserModule),],
  controllers: [DailyProgressController],
  providers: [
    DailyProgressService,
    NotificationService,
    MailerService,
    WhatsAppMsgService,
    SmsService,
  ],
})
export class DailyProgressModule {}
