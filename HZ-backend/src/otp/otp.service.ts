import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Otp } from './entities/otp.entity';
import {
  ExistingUser,
  ReturnOtpDto,
  SendOtpDto,
  userStatus,
  VerifyOtpDto,
  VerifyPasswordDto,
} from './dto/otp.dto';
import { User } from 'src/user/entities/user.entity';
import { UserBranchMembership } from 'src/branch/entities/user-branch-membership.entity';
import { MailerService } from 'src/sendEmail.service';
import { SmsService } from 'src/sms.service';
import { AuthService } from 'src/authSession/auth.service';
import { ReturnUserDto } from 'src/user/dto/user.dto';
import { otpEmailTemplate } from 'src/emailTemplates';

export const DLT_TEMPLATES = {
  LOGIN_OTP: {
    id: '1707176050742281427',
    text: (otp: string) =>
      `Dear User, Your login verification OTP Code is ${otp}. Please do not share this OTP with anyone. Onecasa`,
  },
  ONECASA_OTP: {
    id: '1707176050746186677',
    text: (otp: string) =>
      `Dear User, Your Onecasa verification OTP Code is ${otp}. Please do not share this OTP with anyone.`,
  },
};

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailerService: MailerService,
    private smsService: SmsService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  // -------------------------------
  //  SEND OTP
  // -------------------------------
  async sendOtp(sendOtpDto: SendOtpDto): Promise<ReturnOtpDto> {
    const { email, phone } = sendOtpDto;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    if (email) {
      let existingOtp = await this.otpRepository.findOne({ where: { email } });
      if (existingOtp) {
        existingOtp.otp = otp;
        existingOtp.retryAttempts = 0;
      } else {
        existingOtp = this.otpRepository.create({
          email,
          otp,
          retryAttempts: 0,
        });
      }
      await this.otpRepository.save(existingOtp);

      const htmlTemplate = otpEmailTemplate(otp);
      await this.mailerService.sendMail(
        email,
        'Your OTP Code',
        `Your OTP is ${otp}`,
        htmlTemplate,
      );

      return { email, message: 'OTP sent successfully via email' };
    }

    if (phone) {
      let existingOtp = await this.otpRepository.findOne({ where: { phone } });
      if (existingOtp) {
        existingOtp.otp = otp;
        existingOtp.retryAttempts = 0;
      } else {
        existingOtp = this.otpRepository.create({
          phone,
          otp,
          retryAttempts: 0,
        });
      }
      await this.otpRepository.save(existingOtp);

      const smsMessage = DLT_TEMPLATES.ONECASA_OTP.text(otp);
      const templateId = DLT_TEMPLATES.ONECASA_OTP.id;
      await this.smsService.sendSms(phone, smsMessage, templateId);

      return { phone, message: 'OTP sent successfully via SMS' };
    }

    throw new BadRequestException('Either email or phone must be provided.');
  }

  // -------------------------------
  //  CHECK EXISTING USER
  // -------------------------------
  async existingUser(existingUser: ExistingUser): Promise<userStatus> {
    const { email, phone } = existingUser;
    let user: User | null = null;

    if (email) user = await this.userRepository.findOne({ where: { email } });
    else if (phone)
      user = await this.userRepository.findOne({ where: { phone } });

    return user
      ? { status: true, message: 'User found' }
      : { status: false, message: 'User not found' };
  }

  // -------------------------------
  //  RESEND OTP
  // -------------------------------
  async resendOtp(sendOtpDto: SendOtpDto): Promise<ReturnOtpDto> {
    const { email, phone } = sendOtpDto;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    if (email) {
      const existingOtp = await this.otpRepository.findOne({
        where: { email },
      });
      if (!existingOtp)
        throw new NotFoundException('No OTP found for this email');

      existingOtp.otp = otp;
      existingOtp.retryAttempts += 1;
      if (existingOtp.retryAttempts > 3) {
        await this.otpRepository.remove(existingOtp);
        throw new ConflictException('Maximum resend attempts reached');
      }
      await this.otpRepository.save(existingOtp);

      const htmlTemplate = otpEmailTemplate(otp);
      await this.mailerService.sendMail(
        email,
        'Your OTP Code',
        `Your OTP is ${otp}`,
        htmlTemplate,
      );

      return { email, message: 'OTP resent successfully via email' };
    }

    if (phone) {
      const existingOtp = await this.otpRepository.findOne({
        where: { phone },
      });
      if (!existingOtp)
        throw new NotFoundException('No OTP found for this phone');

      existingOtp.otp = otp;
      existingOtp.retryAttempts += 1;
      if (existingOtp.retryAttempts > 3) {
        await this.otpRepository.remove(existingOtp);
        throw new ConflictException('Maximum resend attempts reached');
      }
      await this.otpRepository.save(existingOtp);

      const smsMessage = DLT_TEMPLATES.ONECASA_OTP.text(otp);
      const templateId = DLT_TEMPLATES.ONECASA_OTP.id;
      await this.smsService.sendSms(phone, smsMessage, templateId);

      return { phone, message: 'OTP resent successfully via SMS' };
    }

    throw new BadRequestException('Either email or phone must be provided.');
  }

  // -------------------------------
  //  VERIFY OTP
  // -------------------------------
  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<ReturnOtpDto> {
    const { email, phone, otp } = verifyOtpDto;

    if (email) {
      const existingOtp = await this.otpRepository.findOne({
        where: { email },
      });
      if (!existingOtp)
        throw new NotFoundException('No OTP found for this email.');
      if (existingOtp.otp !== otp)
        throw new UnauthorizedException('Invalid OTP.');

      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
      await this.otpRepository.remove(existingOtp);

      if (existingUser) {
        return this.buildVerifyResponse(existingUser, { email });
      }
      return { email, message: 'OTP verified. Proceed to registration.' };
    }

    if (phone) {
      const existingOtp = await this.otpRepository.findOne({
        where: { phone },
      });
      if (!existingOtp)
        throw new NotFoundException('No OTP found for this phone number.');
      if (existingOtp.otp !== otp)
        throw new UnauthorizedException('Invalid OTP.');

      const existingUser = await this.userRepository.findOne({
        where: { phone },
      });
      await this.otpRepository.remove(existingOtp);

      if (existingUser) {
        return this.buildVerifyResponse(existingUser, { phone });
      }
      return { phone, message: 'OTP verified. Proceed to registration.' };
    }

    throw new BadRequestException(
      'Invalid request: email or phone must be provided.',
    );
  }

  private async buildVerifyResponse(
    user: User,
    identifier: { email?: string; phone?: string },
  ): Promise<ReturnOtpDto> {
    const memberships = await this.userRepository.manager
      .getRepository(UserBranchMembership)
      .find({
        where: { user: { id: user.id } },
        relations: ['branch', 'branchRoles', 'branchRoles.permissions'],
      });

    const branchMemberships = memberships.map((m) => ({
      branchId: m.branch.id,
      branchName: m.branch.name,
      isBranchHead: m.isBranchHead,
      isPrimary: m.isPrimary,
      branchRoles: m.branchRoles.map((r) => ({
        id: r.id,
        roleName: r.roleName,
      })),
      permissions:
        m.branchRoles
          ?.flatMap((r) => r.permissions ?? [])
          .map((p) => ({
            id: p.id,
            resource: p.resource,
            view: p.view,
            create: p.create,
            edit: p.edit,
            delete: p.delete,
          })) ?? [],
    }));

    const primaryMembership = memberships.find((m) => m.isPrimary);
    const activeBranchId =
      primaryMembership?.branch?.id || memberships[0]?.branch?.id;

    const token = await this.authService.generateJwt(user, activeBranchId);

    return {
      ...identifier,
      message: 'User already exists. Redirect to dashboard.',
      token: token.access_token,
      existingUser: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        profile: user.profile ?? null,
        kind: user.kind,
        role: user.role,
        userkind: user.kind,
      },
      branchMemberships,
    };
  }

  // -------------------------------
  //  PASSWORD LOGIN
  // -------------------------------
  async validateUser(
    verifyPassword: VerifyPasswordDto,
  ): Promise<{ message: string; token?: string; user?: ReturnUserDto }> {
    const { email, password } = verifyPassword;

    const user = await this.authService.validateUserCredentials(
      email,
      password,
    );
    if (!user) {
      return { message: 'Invalid email or password' };
    }

    const tokenResponse = await this.authService.generateJwt(user);
    const userDetails = this.mapToReturnUserDto(user);

    return {
      message: 'Password verified. Access granted.',
      token: tokenResponse.access_token,
      user: userDetails,
    };
  }

  private mapToReturnUserDto(user: User): ReturnUserDto {
    const {
      id,
      profile,
      username,
      email,
      firstName,
      lastName,
      createdAt,
      updatedAt,
      phone,
      kind,
      role,
    } = user;
    return {
      id,
      profile,
      username,
      email,
      firstName,
      lastName,
      createdAt,
      updatedAt,
      phone,
      kind,
      role,
    };
  }
}
