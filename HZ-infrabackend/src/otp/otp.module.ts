import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraOtp } from './entities/infra-otp.entity';
import { InfraCustomer } from '../customer/entities/infra-customer.entity';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { MailService } from '../mail.service';
import { SmsService } from '../sms.service';

@Module({
  imports: [TypeOrmModule.forFeature([InfraOtp, InfraCustomer])],
  controllers: [OtpController],
  providers: [OtpService, MailService, SmsService],
  exports: [OtpService, MailService, SmsService],
})
export class OtpModule {}
