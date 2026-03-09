import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CustomBuilder } from 'src/Custombuilder/entities/custom-builder.entity';
import { DailyProgress } from 'src/Custombuilder/daily-progress/entities/daily-progress.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from 'src/notifications/notification.service';
import { MailerService } from 'src/sendEmail.service';
import { SmsService } from 'src/sms.service';
import { Notification } from 'src/notifications/entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomBuilder, DailyProgress, Notification])],
  providers: [TasksService, NotificationService, MailerService, SmsService],
})
export class TasksModule {}
