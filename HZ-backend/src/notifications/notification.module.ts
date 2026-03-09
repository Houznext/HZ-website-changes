import { Module ,forwardRef} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Notification } from './entities/notification.entity';
import { MailerService } from 'src/sendEmail.service';
import { SmsService } from 'src/sms.service';
import { UserModule } from 'src/user/user.module';
import { ChatNotificationListener } from './chat-notification.listener';
import { OrderNotificationListener } from './order-notification.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]),forwardRef(() => UserModule),],
  providers: [NotificationService, MailerService, SmsService, ChatNotificationListener, OrderNotificationListener],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
