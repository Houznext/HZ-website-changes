import { forwardRef, Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { MailerService } from 'src/sendEmail.service';
import { User } from 'src/user/entities/user.entity';
import { SmsService } from 'src/sms.service';
import { AuthModule } from 'src/authSession/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Otp, User]),
    forwardRef(() => AuthModule),
  ],
  controllers: [OtpController],
  providers: [OtpService, MailerService, SmsService],
  exports: [OtpService],
})
export class OtpModule {}
