import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Property } from 'src/property/entities/property.entity';
import { User } from 'src/user/entities/user.entity';

import { PropertyReferralAgreement } from './entities/propertyreferralagreement.entity';
import {
  CreateReferralAgreementDto,
  ListReferAndEarnPropertiesDto,
  UpdateAgreementStatusDto,
  UpdateReferralAgreementDto,
} from './dtos/property-referral-agreement.dto';
import { MailerService } from 'src/sendEmail.service';
import { NotificationService } from 'src/notifications/notification.service';

import {
  ContactRouting,
  ReferAndEarnStatus,
  ReferralCaseStatus,
} from './enum/refer-and-earn.enum';

import { ReferralCase } from './entities/referralcase.entity';
import { ReferralCaseStepLog } from './entities/referralcasesteplog.entity';
import {
  CreateReferralCaseDto,
  ListReferralCasesDto,
  UpdateReferralCaseByUserDto,
  UpdateReferralCaseStepDto,
} from './dtos/referral-case.dto';
import { WhatsAppMsgService } from 'src/whatsApp.service';
const STEPS = [
  'Calling & informing',
  'Site visit & confirmation',
  'Finances',
  'Advance Payment',
  'Registration',
];

@Injectable()
export class ReferAndEarnService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(PropertyReferralAgreement)
    private readonly agreementRepo: Repository<PropertyReferralAgreement>,

    @InjectRepository(ReferralCase)
    private readonly referralCaseRepo: Repository<ReferralCase>,
    private notificationService: NotificationService,
    private readonly mailerService: MailerService,
    private readonly whatsAppMsgService: WhatsAppMsgService,

    @InjectRepository(ReferralCaseStepLog)
    private readonly referralLogRepo: Repository<ReferralCaseStepLog>,
  ) {}

  /************************ AGREEMENTS (ADMIN) ************************/

  async createAgreement(dto: CreateReferralAgreementDto) {
    const property = await this.propertyRepo.findOne({
      where: { propertyId: dto.propertyId as any },
      relations: ['postedByUser', 'basicDetails', 'locationDetails'],
    });
    if (!property) throw new NotFoundException('Property not found');

    const approvedBy = dto.approvedByUserId
      ? await this.userRepo.findOne({
          where: { id: dto.approvedByUserId as any },
        })
      : null;

    const agreement = this.agreementRepo.create({
      property,
      status: ReferAndEarnStatus.PENDING,
      brokerageModel: dto.brokerageModel,
      brokerageValue: dto.brokerageValue,
      referrerValue:dto.referrerValue,
      minBrokerageAmount: dto.minBrokerageAmount,
      referrerSharePercent: dto.referrerSharePercent,
      referrerMaxCredits: dto.referrerMaxCredits,
      hideOwnerContactFromPublic: dto.hideOwnerContactFromPublic ?? true,
      effectiveFrom: dto.effectiveFrom,
      effectiveTo: dto.effectiveTo,
      notes: dto.notes,
      approvedBy: approvedBy ?? undefined,
    });

    return this.agreementRepo.save(agreement);
  }

  async updateAgreementStatus(
    agreementId: number,
    dto: UpdateAgreementStatusDto,
  ) {
    const agreement = await this.agreementRepo.findOne({
      where: { id: agreementId as any },
      relations: ['property'],
    });
    if (!agreement) throw new NotFoundException('Agreement not found');

    const admin = await this.userRepo.findOne({
      where: { id: dto.adminUserId as any },
    });
    if (!admin) throw new NotFoundException('Admin user not found');

    return this.dataSource.transaction(async (manager) => {
      agreement.status = dto.status;
      agreement.approvedBy = admin;
      if (dto.notes) agreement.notes = dto.notes;

      await manager.getRepository(PropertyReferralAgreement).save(agreement);

      // ✅ toggle property flags based on agreement status
      if (dto.status === ReferAndEarnStatus.ACTIVE) {
        agreement.property.isReferAndEarnEnabled = true;
        agreement.property.contactRouting = ContactRouting.ONECASA_INTERNAL;
      } else if (
        dto.status === ReferAndEarnStatus.PAUSED ||
        dto.status === ReferAndEarnStatus.REJECTED ||
        dto.status === ReferAndEarnStatus.EXPIRED
      ) {
        agreement.property.isReferAndEarnEnabled = false;
        agreement.property.contactRouting = ContactRouting.OWNER;
      }

      await manager.getRepository(Property).save(agreement.property);
      return agreement;
    });
  }

  async listAgreements(query: ListReferAndEarnPropertiesDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const qb = this.agreementRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.property', 'p')
      .leftJoinAndSelect('p.basicDetails', 'basicDetails')
      .leftJoinAndSelect('p.locationDetails', 'locationDetails')
      .orderBy('a.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.status)
      qb.andWhere('a.status = :status', { status: query.status });
    if (query.city)
      qb.andWhere('locationDetails.city ILIKE :city', {
        city: `%${query.city}%`,
      });
    if (query.locality)
      qb.andWhere('locationDetails.locality ILIKE :loc', {
        loc: `%${query.locality}%`,
      });

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /************************ FEED (USER) ************************/

  async listReferAndEarnProperties(query: ListReferAndEarnPropertiesDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const qb = this.propertyRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.basicDetails', 'basicDetails')
      .leftJoinAndSelect('p.locationDetails', 'locationDetails')
      .leftJoinAndSelect('p.mediaDetails', 'mediaDetails')
      .leftJoinAndSelect('p.propertyDetails', 'propertyDetails')
      .leftJoinAndSelect('propertyDetails.pricingDetails', 'pricingDetails')
      .leftJoinAndSelect('propertyDetails.residentialAttributes', 'residentialAttributes')
      .leftJoinAndSelect('propertyDetails.constructionStatus', 'constructionStatus')
      .leftJoinAndSelect('propertyDetails.facilities', 'facilities')
      .leftJoinAndSelect('p.referralAgreements', 'referralAgreements')
      .where('p.isPosted = true')
      .andWhere('p.isReferAndEarnEnabled = true')
      .orderBy('p.postedDate', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.city)
      qb.andWhere('locationDetails.city ILIKE :city', {
        city: `%${query.city}%`,
      });
    if (query.locality)
      qb.andWhere('locationDetails.locality ILIKE :loc', {
        loc: `%${query.locality}%`,
      });

    const [data, total] = await qb.getManyAndCount();

    // ✅ return safe payload + show if owner contact is hidden
    const safe = data.map((p: any) => ({
      ...p,
      postedByUser: undefined,
      ownerContactHidden: p.contactRouting === ContactRouting.ONECASA_INTERNAL,
    }));

    return {
      data: safe,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /************************ REFERRAL CASES (USER) ************************/

  async createReferralCase(dto: CreateReferralCaseDto) {
    const property = await this.propertyRepo.findOne({
      where: { propertyId: dto.propertyId as any },
    });
    if (!property) throw new NotFoundException('Property not found');

    if (!property.isReferAndEarnEnabled) {
      throw new BadRequestException(
        'This property is not available for Refer & Earn',
      );
    }

    const referrer = await this.userRepo.findOne({
      where: { id: dto.referrerUserId as any },
    });
    if (!referrer) throw new NotFoundException('Referrer not found');

    const openCount = await this.referralCaseRepo.count({
      where: {
        referrer: { id: dto.referrerUserId as any },
        status: ReferralCaseStatus.OPEN,
      } as any,
    });

    if (openCount >= 10) {
      throw new BadRequestException(
        'Referral limit reached (max 10 active referrals)',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const now = new Date();

      const referralCase = manager.getRepository(ReferralCase).create({
        property,
        referrer,
        leadName: dto.leadName ?? null,
        leadPhone: dto.leadPhone ?? null,
        leadEmail: dto.leadEmail ?? null,
        leadCity: dto.leadCity ?? null,
        requirementNote: dto.requirementNote ?? null,
        currentStep: 1,
        step1Date: now,
        status: ReferralCaseStatus.OPEN,
        referralCode: await this.generateReferralCode(dto.propertyId),
        relationshipType: dto.relationshipType ?? null,
        category: dto.category ?? null,
      } as any);

      const savedCase = await manager
        .getRepository(ReferralCase)
        .save(referralCase);

      await manager.getRepository(ReferralCaseStepLog).save(
        manager.getRepository(ReferralCaseStepLog).create({
          referralCase: savedCase,
          fromStep: 0,
          toStep: 1,
          updatedBy: referrer,
          note: 'Referral created',
        } as any),
      );
       if (referrer) {

      if (referrer.email) {
        const emailBody = `Hi ${referrer.fullName ?? ''},

Your referral has been created successfully.

Property: ${property.propertyDetails?.propertyName ?? 'N/A'}


Thank you for referring with OneCasa. We will keep you updated as the referral progresses.

Best regards,
OneCasa Team
`;

        await this.notificationService.sendEmailNotification({
          email: referrer.email,
          template: emailBody,
        });
      }

      await this.notificationService.createNotification({
        userId: referrer.id,
        message: `Your referral for ${
          property.propertyDetails?.propertyName ?? 'a property'
        } has been created successfully .`,
      });

//       if (referrer.phone) {
//         const message = `Hello ${referrer.fullName ?? ''},

// Your referral for ${
//           property.propertyDetails?.propertyName ?? 'a property'
//         } has been created successfully .

// You can track the progress from your dashboard.
// Thank you for referring with OneCasa.`;

//         await this.whatsAppMsgService.sendMessage(referrer.phone, message);
//       } 
} 
      const propertyOwner = property.postedByUser;
      

      if (propertyOwner) {
        await this.notificationService.createNotification({
          userId: propertyOwner.id,
          message: `You have received a new referral for your property "${
            property.propertyDetails?.propertyName ?? ''
          }" `,
        });
      

      if (propertyOwner?.email) {
        const ownerEmailBody = `Hi ${propertyOwner.fullName ?? ''},

You have received a new referral for your property.

Property: ${property.propertyDetails?.propertyName ?? 'N/A'}

Referred By: ${referrer.fullName ?? 'A user'}

Please log in to your dashboard to review the referral details.

Best regards,
OneCasa Team
`;

        await this.notificationService.sendEmailNotification({
          email: propertyOwner.email,
          template: ownerEmailBody,
        });
      }

      //       if (propertyOwner?.phone) {
      //         const ownerMessage = `Hello ${propertyOwner.fullName ?? ''},

      // You have received a new referral for your property "${
      //           property.propertyDetails?.propertyName ?? ''
      //         }" .

      // Please check your dashboard for more details.

      // – OneCasa Team`;

      //         await this.whatsAppMsgService.sendMessage(
      //           propertyOwner.phone,
      //           ownerMessage,
      //         );
      //       }
    }

      return savedCase;
    });
  }

  async getMyReferrals(referrerUserId: string) {
    return this.referralCaseRepo.find({
      where: { referrer: { id: referrerUserId } } as any,
      relations: [
        'property',
        'property.basicDetails',
        'property.locationDetails',
        'property.mediaDetails',
        'property.propertyDetails',
        'property.propertyDetails.pricingDetails',
        'property.referralAgreements',
      ],
      order: { createdAt: 'DESC' as any },
    });
  }

  async getReferralDetails(referralCaseId: string) {
    const referral = await this.referralCaseRepo.findOne({
      where: { id: referralCaseId as any } as any,
      relations: [
        'property',
        'property.basicDetails',
        'property.locationDetails',
        'property.mediaDetails',
        'property.propertyDetails',
        'stepLogs',
        'stepLogs.updatedBy',
        'assignedTo',
        'referrer',
      ],
    });

    if (!referral) throw new NotFoundException('Referral case not found');
    return referral;
  }

  /************************ REFERRAL CASES (ADMIN) ************************/

  async adminListReferrals(query: ListReferralCasesDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const qb = this.referralCaseRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.property', 'p')
      .leftJoinAndSelect('p.basicDetails', 'basicDetails')
      .leftJoinAndSelect('p.locationDetails', 'locationDetails')
      .leftJoinAndSelect('r.referrer', 'referrer')
      .leftJoinAndSelect('r.assignedTo', 'assignedTo')
      .orderBy('r.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.referrerUserId)
      qb.andWhere('referrer.id = :rid', { rid: query.referrerUserId });
    if (query.propertyId)
      qb.andWhere('p.propertyId = :pid', { pid: query.propertyId });
    if (query.step) qb.andWhere('r.currentStep = :step', { step: query.step });
    if (query.status)
      qb.andWhere('r.status = :status', { status: query.status });

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateReferralStep(
    referralCaseId: string,
    dto: UpdateReferralCaseStepDto,
  ) {
    const referral = await this.referralCaseRepo.findOne({
      where: { id: referralCaseId as any } as any,
      relations: ['property', 'referrer'],
    });
    if (!referral) throw new NotFoundException('Referral case not found');

    const admin = await this.userRepo.findOne({
      where: { id: dto.adminUserId as any },
    });
    if (!admin) throw new NotFoundException('Admin user not found');

    if (dto.toStep < 1 || dto.toStep > 5) {
      throw new BadRequestException('Invalid step. Must be between 1 and 5');
    }

    const isCurrentlyOpen = referral.status === ReferralCaseStatus.OPEN;
    const isRevertingToOpen = dto.status === ReferralCaseStatus.OPEN;
    if (!isCurrentlyOpen && !isRevertingToOpen) {
      throw new BadRequestException(
        'Updates are only allowed when referral status is Open. Set status to Open and update to make changes.',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const prev = referral.currentStep;
      referral.currentStep = dto.toStep;

      const now = new Date();
      if (dto.toStep === 1) referral.step1Date = referral.step1Date ?? now;
      if (dto.toStep === 2) referral.step2Date = referral.step2Date ?? now;
      if (dto.toStep === 3) referral.step3Date = referral.step3Date ?? now;
      if (dto.toStep === 4) referral.step4Date = referral.step4Date ?? now;
      if (dto.toStep === 5) referral.step5Date = referral.step5Date ?? now;

      if (dto.status) referral.status = dto.status;
      if (dto.note) referral.adminRemarks = dto.note;

      if (dto.assignedToUserId) {
        const assignee = await manager.getRepository(User).findOne({
          where: { id: dto.assignedToUserId as any },
        });
        if (!assignee) throw new NotFoundException('Assignee not found');
        referral.assignedTo = assignee;
      }

      await manager.getRepository(ReferralCase).save(referral);

      await manager.getRepository(ReferralCaseStepLog).save(
        manager.getRepository(ReferralCaseStepLog).create({
          referralCase: referral,
          fromStep: prev,
          toStep: dto.toStep,
          updatedBy: admin,
          note: dto.note,
        } as any),
      );
      const stepName = STEPS[dto.toStep - 1];
      const referrer = referral.referrer;

      if (referrer) {
        const formattedDate = referral.updatedAt.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        const propertyName =
          referral.property?.propertyDetails?.propertyName ?? 'a property';

        await this.notificationService.createNotification({
          userId: referrer.id,
          message: `Your referral for ${propertyName} has moved to step "${stepName}" on ${formattedDate}.`,
        });

        if (referrer.email) {
          const emailBody = `Hi ${referrer.fullName ?? ''},

We would like to inform you that your referral has progressed to the next stage.

Property: ${propertyName}
Current Step: ${stepName}
Last Updated On: ${formattedDate}

Thank you for trusting OneCasa with your referral. We will continue to keep you informed as the process moves forward.

If you have any questions, feel free to reach out to our support team.

Best regards,
OneCasa Team
`;

          await this.notificationService.sendEmailNotification({
            email: referrer.email,
            template: emailBody,
          });
        }

        // if (referrer.phone) {
        //   const message = `Hello ${referrer.fullName ?? ''},Your referral for ${propertyName} has moved to the next stage. Current Step: ${stepName} Updated On: ${formattedDate} Please log in to your dashboard to view the latest updates.Thank you for referring with OneCasa.`;

        //   await this.whatsAppMsgService.sendMessage(referrer.phone, message);
        // }
      }

      return referral;
    });
  }

  async updateAgreement(agreementId: number, dto: UpdateReferralAgreementDto) {
    const agreement = await this.agreementRepo.findOne({
      where: { id: agreementId as any },
      relations: ['property'],
    });
    if (!agreement) throw new NotFoundException('Agreement not found');

    // optional: validate admin exists
    if (dto.approvedByUserId) {
      const admin = await this.userRepo.findOne({
        where: { id: dto.approvedByUserId as any },
      });
      if (!admin) throw new NotFoundException('Admin user not found');
      agreement.approvedBy = admin; // or create "updatedBy" column ideally
    }

    // update only fields sent
    if (dto.brokerageModel !== undefined)
      agreement.brokerageModel = dto.brokerageModel;
    if (dto.brokerageValue !== undefined)
      agreement.brokerageValue = dto.brokerageValue;
    if (dto.referrerValue !== undefined)
      agreement.referrerValue = dto.referrerValue;
    if (dto.minBrokerageAmount !== undefined)
      agreement.minBrokerageAmount = dto.minBrokerageAmount;
    if (dto.referrerSharePercent !== undefined)
      agreement.referrerSharePercent = dto.referrerSharePercent;
    if (dto.referrerMaxCredits !== undefined)
      agreement.referrerMaxCredits = dto.referrerMaxCredits;
    if (dto.hideOwnerContactFromPublic !== undefined)
      agreement.hideOwnerContactFromPublic = dto.hideOwnerContactFromPublic;
    if (dto.effectiveFrom !== undefined)
      agreement.effectiveFrom = new Date(dto.effectiveFrom);
    if (dto.effectiveTo !== undefined)
      agreement.effectiveTo = new Date(dto.effectiveTo);
    if (dto.notes !== undefined) agreement.notes = dto.notes;

    return this.agreementRepo.save(agreement);
  }

  async deleteAgreement(agreementId: number, adminUserId: string) {
    const agreement = await this.agreementRepo.findOne({
      where: { id: agreementId as any },
      relations: ['property'],
    });
    if (!agreement) throw new NotFoundException('Agreement not found');

    const admin = await this.userRepo.findOne({
      where: { id: adminUserId as any },
    });
    if (!admin) throw new NotFoundException('Admin user not found');

    return this.dataSource.transaction(async (manager) => {
      if (agreement.status === ReferAndEarnStatus.ACTIVE) {
        agreement.property.isReferAndEarnEnabled = false;
        agreement.property.contactRouting = ContactRouting.OWNER;
        await manager.getRepository(Property).save(agreement.property);
      }

      await manager
        .getRepository(PropertyReferralAgreement)
        .delete({ id: agreementId as any });

      return { success: true, deletedAgreementId: agreementId };
    });
  }
  async getAgreementsByProperty(propertyId: string) {
    const property = await this.propertyRepo.findOne({
      where: { propertyId: propertyId as any },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const agreements = await this.agreementRepo.find({
      where: {
        property: { propertyId: propertyId as any },
      } as any,
      relations: ['property', 'approvedBy'],
      order: {
        createdAt: 'DESC' as any,
      },
    });

    return agreements;
  }

  async updateReferralByUser(
    referralCaseId: string,
    dto: UpdateReferralCaseByUserDto,
  ) {
    const referral = await this.referralCaseRepo.findOne({
      where: { id: referralCaseId as any } as any,
      relations: ['referrer', 'property'],
    });

    if (!referral) throw new NotFoundException('Referral case not found');

    if (dto.referrerUserId && referral.referrer?.id !== dto.referrerUserId) {
      throw new BadRequestException(
        'You are not allowed to edit this referral',
      );
    }

    if (referral.status !== ReferralCaseStatus.OPEN) {
      throw new BadRequestException(
        'Referral cannot be edited after it is processed',
      );
    }

    if (referral.currentStep > 1) {
      throw new BadRequestException('Referral cannot be edited after step 1');
    }

    if (dto.leadName !== undefined) referral.leadName = dto.leadName ?? null;
    if (dto.leadPhone !== undefined) referral.leadPhone = dto.leadPhone ?? null;
    if (dto.leadEmail !== undefined) referral.leadEmail = dto.leadEmail ?? null;
    if (dto.leadCity !== undefined) referral.leadCity = dto.leadCity ?? null;
    if (dto.requirementNote !== undefined)
      referral.requirementNote = dto.requirementNote ?? null;
    if (dto.relationshipType !== undefined)
      referral.relationshipType = dto.relationshipType ?? null;

    const saved = await this.referralCaseRepo.save(referral);

    if (dto.referrerUserId) {
      const referrer = await this.userRepo.findOne({
        where: { id: dto.referrerUserId as any },
      });

      if (referrer) {
        await this.referralLogRepo.save(
          this.referralLogRepo.create({
            referralCase: saved,
            fromStep: saved.currentStep,
            toStep: saved.currentStep,
            updatedBy: referrer,
            note: 'Referral updated by referrer',
          } as any),
        );
      }
    }

    return saved;
  }

  async cancelReferralByUser(referralCaseId: string, referrerUserId: string) {
    const referral = await this.referralCaseRepo.findOne({
      where: { id: referralCaseId as any } as any,
      relations: ['referrer', 'property'],
    });

    if (!referral) throw new NotFoundException('Referral case not found');

    if (referral.referrer?.id !== referrerUserId) {
      throw new BadRequestException(
        'You are not allowed to cancel this referral',
      );
    }

    // ✅ allow cancel only when OPEN
    if (referral.status !== ReferralCaseStatus.OPEN) {
      throw new BadRequestException(
        'Referral cannot be cancelled after it is processed',
      );
    }

    // ✅ soft delete: keep row, set status and deletedAt
    referral.status = ReferralCaseStatus.CANCELLED;
    referral.deletedAt = new Date();

    const saved = await this.referralCaseRepo.save(referral);

    // ✅ log cancel
    const referrer = await this.userRepo.findOne({
      where: { id: referrerUserId as any },
    });

    if (referrer) {
      await this.referralLogRepo.save(
        this.referralLogRepo.create({
          referralCase: saved,
          fromStep: saved.currentStep,
          toStep: saved.currentStep,
          updatedBy: referrer,
          note: 'Referral cancelled by referrer',
        } as any),
      );
    }

    return { success: true, cancelledReferralCaseId: referralCaseId };
  }

  async generateReferralCode(propertyId: string) {
    const property = await this.propertyRepo.findOne({
      where: { propertyId: propertyId as any },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const referralCode = Math.floor(Math.random() * 900000) + 100000;

    return { success: true, referralCode };
  }
}
