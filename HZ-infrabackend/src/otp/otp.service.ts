import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InfraOtp } from './entities/infra-otp.entity';
import { InfraCustomer } from '../customer/entities/infra-customer.entity';
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { MailService } from '../mail.service';
import { SmsService } from '../sms.service';
import { DLT_TEMPLATES, otpEmailHtml } from './otp.constants';

const OTP_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(InfraOtp)
    private readonly otpRepo: Repository<InfraOtp>,
    @InjectRepository(InfraCustomer)
    private readonly customerRepo: Repository<InfraCustomer>,
    private readonly mail: MailService,
    private readonly sms: SmsService,
    private readonly jwt: JwtService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async purgeExpired(): Promise<void> {
    await this.otpRepo.delete({ expiresAt: LessThan(new Date()) });
  }

  async send(dto: SendOtpDto): Promise<{ message: string }> {
    const { email, phone } = dto;
    if (!email && !phone) {
      throw new BadRequestException('Either email or phone must be provided');
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    if (email) {
      let row = await this.otpRepo.findOne({ where: { email } });
      if (row) {
        row.otp = otp;
        row.retryAttempts = 0;
        row.expiresAt = expiresAt;
      } else {
        row = this.otpRepo.create({ email, otp, retryAttempts: 0, expiresAt });
      }
      await this.otpRepo.save(row);
      await this.mail.sendMail(email, 'Your Houznext Infra OTP', `Your OTP is ${otp}`, otpEmailHtml(otp));
      return { message: 'OTP sent successfully via email' };
    }

    let row = await this.otpRepo.findOne({ where: { phone } });
    if (row) {
      row.otp = otp;
      row.retryAttempts = 0;
      row.expiresAt = expiresAt;
    } else {
      row = this.otpRepo.create({ phone, otp, retryAttempts: 0, expiresAt });
    }
    await this.otpRepo.save(row);
    const smsBody = DLT_TEMPLATES.HOUZNEXT_SMS_OTP.text(otp);
    await this.sms.sendSms(phone!, smsBody);
    return { message: 'OTP sent successfully via SMS' };
  }

  async verify(dto: VerifyOtpDto): Promise<{ accessToken: string; customer: InfraCustomer }> {
    const { email, phone, otp } = dto;
    if (!email && !phone) {
      throw new BadRequestException('Either email or phone must be provided');
    }

    const row = email
      ? await this.otpRepo.findOne({ where: { email } })
      : await this.otpRepo.findOne({ where: { phone } });

    if (!row) throw new NotFoundException('No OTP found');
    if (row.expiresAt < new Date()) {
      await this.otpRepo.remove(row);
      throw new UnauthorizedException('OTP expired');
    }
    if (row.otp !== otp) throw new UnauthorizedException('Invalid OTP');

    await this.otpRepo.remove(row);

    let customer = email
      ? await this.customerRepo.findOne({ where: { email } })
      : await this.customerRepo.findOne({ where: { phone } });

    if (!customer) {
      customer = this.customerRepo.create({
        email: email ?? null,
        phone: phone ?? null,
        isVerified: true,
      });
    } else {
      customer.isVerified = true;
      if (email) customer.email = email;
      if (phone) customer.phone = phone;
    }
    customer = await this.customerRepo.save(customer);

    const accessToken = await this.jwt.signAsync({
      sub: customer.customerId,
      customerId: customer.customerId,
      kind: 'customer',
      phone: customer.phone ?? undefined,
      email: customer.email ?? undefined,
      name: customer.name ?? undefined,
    });

    return { accessToken, customer };
  }

  async consumePhoneOtpIfValid(phone: string, otp: string): Promise<void> {
    const row = await this.otpRepo.findOne({ where: { phone } });
    if (!row) throw new UnauthorizedException('No OTP for this phone');
    if (row.otp !== otp) throw new UnauthorizedException('Invalid OTP');
    await this.otpRepo.remove(row);
  }
}
