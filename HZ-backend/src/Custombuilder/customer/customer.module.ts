import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { User } from 'src/user/entities/user.entity';
import { OtpService } from 'src/otp/otp.service';
import { Otp } from 'src/otp/entities/otp.entity';
import { OtpModule } from 'src/otp/otp.module';
import { MailerService } from 'src/sendEmail.service';
import { SmsService } from 'src/sms.service';
import { AuthModule } from 'src/authSession/auth.module';
import { LocationDetails } from 'src/property/entities/location.entity';
import { NotificationService } from 'src/notifications/notification.service';
import { Notification } from 'src/notifications/entities/notification.entity';
import { WhatsAppMsgService } from 'src/whatsApp.service';
import { UserModule } from 'src/user/user.module';
import { Branch } from 'src/branch/entities/branch.entity';
import { BranchRole } from 'src/branchRole/entities/branch-role.entity';
import { BranchModule } from 'src/branch/branch.module';
import { CustomBuilder} from 'src/Custombuilder/entities/custom-builder.entity'
import { CustomBuilderModule } from 'src/Custombuilder/custom-builder.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, Otp, LocationDetails, Notification, Branch, BranchRole,CustomBuilder]),
    OtpModule,
    AuthModule,
    forwardRef(() => UserModule),
    forwardRef(() => BranchModule), 
    forwardRef(() => CustomBuilderModule),
  ],
  controllers: [CustomerController],
  providers: [
    CustomerService,
    OtpService,
    MailerService,
    SmsService,
    NotificationService,
    WhatsAppMsgService,
  ],
  exports: [CustomerService],
})
export class CustomerModule {}
