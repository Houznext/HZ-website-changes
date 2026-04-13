import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomBuilder } from '../entities/custom-builder.entity';
import { CBService } from './entities/cb-service.entity';
import { CBServiceController } from './cb-service.controller';
import { CBServiceService } from './cb-service.service';
import { NotificationService } from 'src/notifications/notification.service';
import { Notification } from 'src/notifications/entities/notification.entity';
import { MailerService } from 'src/sendEmail.service';
import { SmsService } from 'src/sms.service';
 import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([CBService, CustomBuilder, Notification]),forwardRef(() => UserModule),],
  controllers: [CBServiceController],
  providers: [CBServiceService, NotificationService, MailerService, SmsService],
})
export class CBServiceModule {}
