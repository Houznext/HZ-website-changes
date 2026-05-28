import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as bcrypt from 'bcrypt';
import { InfraOtp } from './entities/infra-otp.entity';
import { InfraCustomer } from '../customer/entities/infra-customer.entity';
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { MailService } from '../mail.service';
import { SmsService } from '../sms.service';
import { DLT_TEMPLATES, otpEmailHtml } from './otp.constants';

const OTP_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

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

  private normalizePhone(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (digits.length >= 10) return digits.slice(-10);
    return digits;
  }

  private smsTo(phone10: string): string {
    return phone10.length === 10 ? `+91${phone10}` : phone10.startsWith('+') ? phone10 : `+${phone10}`;
  }

  private isPhoneRegistered(customer: InfraCustomer | null): boolean {
    return Boolean(
      customer &&
        customer.isVerified &&
        (customer.name ?? '').trim().length > 0,
    );
  }

  private isEmailRegistered(customer: InfraCustomer | null): boolean {
    return Boolean(customer?.passwordHash && customer.isVerified);
  }

  async send(dto: SendOtpDto): Promise<{ message: string }> {
    const mode = dto.mode ?? 'login';
    const { email } = dto;

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      const customer = await this.customerRepo
        .createQueryBuilder('c')
        .where('LOWER(c.email) = LOWER(:email)', { email: normalizedEmail })
        .getOne();

      if (mode === 'login') {
        throw new BadRequestException('Use email and password to log in.');
      }
      if (mode === 'signup' && this.isEmailRegistered(customer)) {
        throw new BadRequestException(
          'An account with this email already exists. Please log in.',
        );
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + OTP_TTL_MS);
      let row = await this.otpRepo.findOne({ where: { email: normalizedEmail } });
      if (row) {
        row.otp = otp;
        row.retryAttempts = 0;
        row.expiresAt = expiresAt;
      } else {
        row = this.otpRepo.create({
          email: normalizedEmail,
          otp,
          retryAttempts: 0,
          expiresAt,
        });
      }
      await this.otpRepo.save(row);
      await this.mail.sendMail(
        normalizedEmail,
        'Your Houznext Infra verification code',
        `Your OTP is ${otp}`,
        otpEmailHtml(otp),
      );
      return { message: 'OTP sent successfully via email' };
    }

    const phone = this.normalizePhone(dto.phone ?? '');
    if (phone.length !== 10) {
      throw new BadRequestException('Enter a valid 10-digit mobile number.');
    }

    let customer = await this.customerRepo.findOne({ where: { phone } });
    const registered = this.isPhoneRegistered(customer);

    if (mode === 'login' && !registered) {
      throw new BadRequestException(
        'This mobile number is not registered. Please sign up first.',
      );
    }
    if (mode === 'signup' && registered) {
      throw new BadRequestException(
        'This mobile number is already registered. Please log in.',
      );
    }

    if (mode === 'signup' && !customer) {
      customer = this.customerRepo.create({
        phone,
        email: null,
        name: dto.fullName?.trim() || null,
        isVerified: false,
      });
      await this.customerRepo.save(customer);
    } else if (mode === 'signup' && customer && dto.fullName?.trim()) {
      customer.name = dto.fullName.trim();
      await this.customerRepo.save(customer);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
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
    const to = this.smsTo(phone);
    try {
      await this.sms.sendSms(to, smsBody);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (process.env.NODE_ENV === 'development') {
        this.logger.warn(`[OTP dev] phone=${phone} to=${to} code=${otp} (SMS failed: ${msg})`);
        return { message: 'OTP sent (dev: see backend console for code)' };
      }
      throw e;
    }
    return { message: 'OTP sent successfully via SMS' };
  }

  async verify(dto: VerifyOtpDto): Promise<{ accessToken: string; customer: InfraCustomer }> {
    const mode = dto.mode ?? 'login';
    const { email, otp } = dto;

    if (email) {
      if (mode !== 'signup') {
        throw new BadRequestException('Email verification is only used for sign up.');
      }
      if (!dto.password || dto.password.length < 8) {
        throw new BadRequestException('Password must be at least 8 characters.');
      }

      const normalizedEmail = email.trim().toLowerCase();
      const row = await this.otpRepo.findOne({ where: { email: normalizedEmail } });
      if (!row) throw new NotFoundException('No OTP found. Request a new code.');
      if (row.expiresAt < new Date()) {
        await this.otpRepo.remove(row);
        throw new UnauthorizedException('OTP expired');
      }
      if (row.otp !== otp) throw new UnauthorizedException('Invalid OTP');
      await this.otpRepo.remove(row);

      let customer = await this.customerRepo
        .createQueryBuilder('c')
        .where('LOWER(c.email) = LOWER(:email)', { email: normalizedEmail })
        .getOne();

      if (this.isEmailRegistered(customer)) {
        throw new ConflictException('An account with this email already exists. Please log in.');
      }

      const passwordHash = await bcrypt.hash(dto.password, 10);
      if (!customer) {
        customer = this.customerRepo.create({
          email: normalizedEmail,
          passwordHash,
          phone: null,
          name: dto.fullName?.trim() || null,
          isVerified: true,
        });
      } else {
        customer.email = normalizedEmail;
        customer.passwordHash = passwordHash;
        customer.isVerified = true;
        if (dto.fullName?.trim()) customer.name = dto.fullName.trim();
      }
      customer = await this.customerRepo.save(customer);
      const accessToken = await this.signCustomerToken(customer);
      return { accessToken, customer };
    }

    const phone = this.normalizePhone(dto.phone ?? '');
    if (phone.length !== 10) {
      throw new BadRequestException('Enter a valid 10-digit mobile number.');
    }

    const row = await this.otpRepo.findOne({ where: { phone } });
    if (!row) throw new NotFoundException('No OTP found. Request a new code.');
    if (row.expiresAt < new Date()) {
      await this.otpRepo.remove(row);
      throw new UnauthorizedException('OTP expired');
    }
    if (row.otp !== otp) throw new UnauthorizedException('Invalid OTP');
    await this.otpRepo.remove(row);

    let customer = await this.customerRepo.findOne({ where: { phone } });
    const registered = this.isPhoneRegistered(customer);

    if (mode === 'login') {
      if (!registered) {
        throw new BadRequestException(
          'This mobile number is not registered. Please sign up first.',
        );
      }
    } else {
      const name = dto.fullName?.trim();
      if (!name) {
        throw new BadRequestException('Full name is required to complete sign up.');
      }
      if (registered) {
        throw new ConflictException(
          'This mobile number is already registered. Please log in.',
        );
      }
      if (!customer) {
        customer = this.customerRepo.create({
          phone,
          name,
          email: null,
          isVerified: true,
        });
      } else {
        customer.phone = phone;
        customer.name = name;
        customer.isVerified = true;
      }
      customer = await this.customerRepo.save(customer);
      const accessToken = await this.signCustomerToken(customer);
      return { accessToken, customer };
    }

    if (!customer) {
      throw new UnauthorizedException('Account not found');
    }
    customer.isVerified = true;
    customer = await this.customerRepo.save(customer);
    const accessToken = await this.signCustomerToken(customer);
    return { accessToken, customer };
  }

  private async signCustomerToken(customer: InfraCustomer): Promise<string> {
    return this.jwt.signAsync({
      sub: customer.customerId,
      customerId: customer.customerId,
      kind: 'customer',
      phone: customer.phone ?? undefined,
      email: customer.email ?? undefined,
      name: customer.name ?? undefined,
    });
  }

  async consumePhoneOtpIfValid(phone: string, otp: string): Promise<void> {
    const normalized = this.normalizePhone(phone);
    const row = await this.otpRepo.findOne({ where: { phone: normalized } });
    if (!row) throw new UnauthorizedException('No OTP for this phone');
    if (row.otp !== otp) throw new UnauthorizedException('Invalid OTP');
    await this.otpRepo.remove(row);
  }
}
