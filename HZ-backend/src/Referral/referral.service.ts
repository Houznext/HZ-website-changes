import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral } from './entities/referral.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateReferralDto } from './dto/referral.dto';
import { ConflictException } from '@nestjs/common';
import { UserRole } from 'src/user/enum/user.enum';
import { In, Between } from 'typeorm';
import { SmsService } from 'src/sms.service';

import { NotificationService } from 'src/notifications/notification.service';
import { WhatsAppMsgService } from 'src/whatsApp.service';
import { MailerService } from 'src/sendEmail.service';
import { generateReferralTemplate } from 'src/emailTemplates';
@Injectable()
export class ReferralService {
  constructor(
    @InjectRepository(Referral)
    private referralRepository: Repository<Referral>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
    private readonly whatsAppMsgService: WhatsAppMsgService,
    private readonly smsService: SmsService,
    private readonly mailerService: MailerService,
  ) {}

  // Flow 1: Create referral with friend's details (Send Invite)
  async createReferral(dto: CreateReferralDto) {
    const user = await this.userRepository.findOne({
      where: { id: dto.referrerId },
    });

    if (!user) {
      throw new NotFoundException('Referrer not found');
    }

    const existingReferral = await this.referralRepository.findOne({
      where: {
        friendEmail: dto.friendEmail,
        friendPhone: dto.friendPhone,
        referrer: { id: user.id },
      },
      relations: ['referrer'],
    });

    if (existingReferral) {
      throw new ConflictException(
        'Referral with this friend already exists for this user.',
      );
    }

    const referral = this.referralRepository.create({
      ...dto,
      referralCode: this.generateReferralCode(user.id),
      referrer: user,
    });

    const savedReferral = await this.referralRepository.save(referral);
    const formattedDate = savedReferral.createdAt.toLocaleString('default', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    this.notificationService.createNotification({
      userId: user.id,
      message: `Your referral for ${dto.friendName || dto.friendEmail || dto.friendPhone} on ${formattedDate} has been submitted.`,
    });
    //   if (user.phone) {
    //   const message = `Hi ${user.fullName|| ''}, your referral for ${dto.friendName || ''} has been received on ${formattedDate}. Thank you!`;
    //   await this.whatsAppMsgService.sendMessage(user.phone, message);
    // }
    // if (user?.phone) {
    //       const smsMessage =  `Hello ${user?.fullName}, your Houznext customer account has been successfully created!`;
    //       await this.smsService.sendSms(user.phone, smsMessage);
    //     }
    const superAdmins = await this.userRepository.find({
      where: { role: UserRole.ADMIN },
    });
    await Promise.all(
      superAdmins.map((admin) =>
        this.notificationService.createNotification({
          userId: admin.id,
          message: `New referral received from ${
            user.fullName || user.email
          } for ${dto.friendName || dto.friendEmail || dto.friendPhone} on ${formattedDate}.`,
        }),
      ),
    );

    const emailTemplate = generateReferralTemplate({
      friendName: dto.friendName,
      friendPhone: dto.friendPhone,
      createdAt: formattedDate,
      referrerName: user.fullName || 'User',
      referralCode: referral.referralCode,
    });
    this.notificationService.sendEmailNotification({
      email: user.email,
      template: emailTemplate,
    });
    await this.mailerService.notifyAdminsAboutReferral(savedReferral);
    return savedReferral;
  }

  // Flow 2: Generate a general referral link for the referrer
  async generateReferralLink(referrerId: string) {
    const user = await this.userRepository.findOne({
      where: { id: referrerId },
    });
    if (!user) throw new NotFoundException('Referrer not found');

    const code = this.generateReferralCode(user.id);
    return { link: `https://houznext.com/refer?code=${code}` };
  }

  async getReferralsByUser(referrerId: string) {
    return this.referralRepository.find({
      where: { referrer: { id: referrerId } },
    });
  }

  async detectReferrerByCode(code: string) {
    const [referrerId] = code.split('-');
    const user = await this.userRepository.findOne({
      where: { id: referrerId },
    });
    if (!user) throw new NotFoundException('Invalid referral code');
    return user;
  }

  private generateReferralCode(userId: string): string {
    const uniqueCode = Math.random().toString(36).substring(2, 8);
    return `${userId}-${uniqueCode}`;
  }

  async deleteReferral(referralId: string): Promise<{ message: string }> {
    const referral = await this.referralRepository.findOne({
      where: { id: referralId },
      relations: ['referrer'],
    });

    if (!referral) {
      throw new NotFoundException('Referral not found');
    }

    await this.referralRepository.remove(referral);

    return { message: 'Referral deleted successfully' };
  }
  async getAllReferralsByUser(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Referral[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const isSuperAdmin = user.role === UserRole.ADMIN;

    const whereCondition: any = {};

    if (!isSuperAdmin) {
      if (!user.states || user.states.length === 0) {
        return [];
      }
      whereCondition.friendCity = In(user.states);
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
      }

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      whereCondition.createdAt = Between(start, end);
    }

    return this.referralRepository.find({
      where: whereCondition,
      relations: ['referrer'],
      order: { id: 'DESC' },
    });
  }
  async deleteMoreReferrals(ids:string[]): Promise<void> {
    const referrals = await this.referralRepository.findBy({
      id: In(ids),
    });

    if (referrals.length !== ids.length) {
      throw new NotFoundException('Some referrals were not found.');
    }

    await this.referralRepository.delete(ids);
  }
}
