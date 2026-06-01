import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { LivebuildOtp } from './entities/livebuild-otp.entity';
import { SmsService } from 'src/sms.service';
import { lbSecret } from './livebuild-auth.guard';

@Injectable()
export class LivebuildOtpService {
  constructor(
    @InjectRepository(LivebuildOtp)
    private readonly otpRepo: Repository<LivebuildOtp>,
    private readonly jwtService: JwtService,
    private readonly smsService: SmsService,
  ) {}

  normalizeMobile(mobile: string): string {
    const trimmed = mobile.trim();
    if (trimmed.startsWith('+')) return trimmed;
    if (trimmed.length === 10) return `+91${trimmed}`;
    return trimmed;
  }

  async sendOtp(mobile: string): Promise<{ message: string }> {
    const normalized = this.normalizeMobile(mobile);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.otpRepo.save({
      mobile: normalized,
      otp,
      expiresAt,
      attempts: 0,
    });

    await this.smsService.sendSms(
      normalized.replace(/^\+/, ''),
      `Your LiveBuild OTP is ${otp}. Valid for 10 minutes.`,
    );

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(
    mobile: string,
    inputOtp: string,
  ): Promise<{ token: string; customerMobile: string }> {
    const normalized = this.normalizeMobile(mobile);
    const record = await this.otpRepo.findOne({ where: { mobile: normalized } });
    if (!record) {
      throw new BadRequestException('OTP not found');
    }
    if (new Date() > record.expiresAt) {
      throw new BadRequestException('OTP expired');
    }
    if (record.attempts >= 3) {
      throw new BadRequestException('Too many attempts');
    }
    if (record.otp !== inputOtp) {
      record.attempts += 1;
      await this.otpRepo.save(record);
      throw new BadRequestException('Invalid OTP');
    }

    await this.otpRepo.delete({ mobile: normalized });

    const token = this.jwtService.sign(
      { sub: normalized, mobile: normalized },
      { secret: lbSecret(), expiresIn: '30d' },
    );

    return { token, customerMobile: normalized };
  }

  assertOtpVerifiedToken(token: string, mobile: string): void {
    const normalized = this.normalizeMobile(mobile);
    try {
      const payload = this.jwtService.verify<{ sub?: string; mobile?: string }>(
        token,
        { secret: lbSecret() },
      );
      const tokenMobile = this.normalizeMobile(
        payload.mobile ?? payload.sub ?? '',
      );
      if (tokenMobile !== normalized) {
        throw new BadRequestException(
          'OTP verification does not match this mobile number',
        );
      }
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException('Invalid or expired OTP verification');
    }
  }
}
