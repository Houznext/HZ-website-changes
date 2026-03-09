import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactUsService } from './contact-us.service';
import { ContactUsController } from './contact-us.controller';
import { ContactUs } from './entities/contact-us.entity';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { MailerService } from 'src/sendEmail.service';
import { NotificationService } from 'src/notifications/notification.service';
import { Notification } from 'src/notifications/entities/notification.entity';
import { SmsService } from 'src/sms.service';
import { WhatsAppMsgService } from 'src/whatsApp.service';
@Module({
     imports:[TypeOrmModule.forFeature([ContactUs, User,Notification]), forwardRef(() => UserModule),],
     controllers: [ContactUsController],
  providers: [ContactUsService,MailerService, NotificationService,SmsService, WhatsAppMsgService,],
})
export class ContactUsModule {}