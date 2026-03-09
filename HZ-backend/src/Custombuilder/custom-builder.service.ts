import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomBuilder } from './entities/custom-builder.entity';
import { Repository } from 'typeorm';
import {
  CreateCustomBuilderDto,
  UpdateCustomBuilderDto,
} from './dto/custom-builder.dto';
import { UserRole } from 'src/user/enum/user.enum';

import { DailyProgress } from 'src/Custombuilder/daily-progress/entities/daily-progress.entity';
import { User } from 'src/user/entities/user.entity';
import { WhatsAppMsgService } from 'src/whatsApp.service';
import { NotificationService } from 'src/notifications/notification.service';
import { generateDocumentUploadTemplate } from 'src/emailTemplates';
import { instanceToPlain } from 'class-transformer';
import { ConstructionScope } from '../Custombuilder/custom-property/enum/custom-property.enum';
import { Branch } from 'src/branch/entities/branch.entity';
import { UserBranchMembership } from 'src/branch/entities/user-branch-membership.entity';
import { RequestUser } from 'src/guard';



@Injectable()
export class CustomBuilderService {
  constructor(
    @InjectRepository(CustomBuilder)
    private readonly customBuilderRepository: Repository<CustomBuilder>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,

    @InjectRepository(UserBranchMembership)
    private readonly membershipRepository: Repository<UserBranchMembership>,

    private readonly ultraMsgService: WhatsAppMsgService,
    private readonly notificationService: NotificationService,
  ) { }


  async create(
    currentUser: RequestUser,
    customerId: string,
    createCustomBuilderDto: CreateCustomBuilderDto,
  ) {
    try {
      const customer = await this.userRepository.findOne({
        where: { id: customerId },
        relations: [
          'customBuilders',
          'branchMemberships',
          'branchMemberships.branch',
        ],
      });
      if (!customer) throw new BadRequestException('Customer not found');
      if (!customer.isVerified)
        throw new BadRequestException('Please verify your phone number first.');


      let branch: Branch | null = null;
      if (createCustomBuilderDto.branchId) {
        branch = await this.branchRepository.findOne({
          where: { id: createCustomBuilderDto.branchId },
        });
        if (!branch) throw new BadRequestException('Invalid branchId');
      } else {
        const primary = (customer.branchMemberships ?? []).find(
          (m) => m.isPrimary,
        );
        if (primary?.branch) branch = primary.branch;
      }
      if (!branch) throw new BadRequestException('Branch context required');


      const createdBy = await this.userRepository.findOne({
        where: { id: currentUser.id },
      });

      const customBuilder = this.customBuilderRepository.create({
        ...createCustomBuilderDto,
        branch,
        customer,
        createdByUser: createdBy || null,
      });

      await this.customBuilderRepository.save(customBuilder);

      if (customer.phone) {
        const message =
          `Hi ${customer.firstName || ''}, your custom builder tracking has been created successfully! ` +
          `You will now start receiving daily progress updates on your registered number.`;
        await this.ultraMsgService.sendMessage(customer.phone, message);
      }

      return {
        message: 'Custom builder created successfully',
        id: customBuilder.id,
      };
    } catch (error: any) {
      console.log('Error creating custom builder:', error.message);
      console.log('Error stack:', error.stack);
      throw error;
    }
  }


  async findAllByUser(
    currentUser: RequestUser,
  ): Promise<Record<string, any>[]> {
    try {
      const isSuperAdmin = currentUser.role === UserRole.ADMIN;

      const isBranchHead = currentUser.branchMembership?.isBranchHead ?? false;

      const qb = this.customBuilderRepository
        .createQueryBuilder('customBuilder')
        .leftJoinAndSelect('customBuilder.customer', 'customer')
        .leftJoinAndSelect(
          'customBuilder.propertyInformation',
          'propertyInformation',
        )
        .leftJoinAndSelect('customBuilder.servicesRequired', 'servicesRequired')
        .leftJoinAndSelect('customBuilder.logs', 'logs')
        .leftJoinAndSelect('customBuilder.location', 'location')
        .leftJoinAndSelect('customBuilder.branch', 'branch')
        .leftJoinAndSelect(
          'propertyInformation.house_construction_info',
          'house_construction_info',
        )
        .leftJoinAndSelect(
          'propertyInformation.interior_info',
          'interior_info',
        )
        .leftJoinAndSelect(
          'propertyInformation.commercial_construction_info',
          'commercial_construction_info',
        )
        .leftJoinAndSelect('customBuilder.createdByUser', 'createdByUser');

      // If NOT (SuperAdmin + BranchHead), restrict
      if (!(isSuperAdmin && isBranchHead)) {
        qb.where(
          '(customBuilder.createdByUserId = :uid OR customBuilder.customerId = :uid)',
          { uid: currentUser.id },
        );
      }

      const customBuilders = await qb.getMany();
      return instanceToPlain(customBuilders) as Record<string, any>[];
    } catch (error: any) {
      console.log('Error retrieving Custom Builders', error.message);
      console.log('Error stack', error.stack);
      throw error;
    }
  }


  async findByUserAdminId(userId: string) {
    try {
      const customBuilder = await this.customBuilderRepository.find({
        where: { customer: { id: userId } },
        relations: [
          'customer',
          'propertyInformation',
          'servicesRequired',
          'logs',
          'location',
          'propertyInformation.house_construction_info',
          'propertyInformation.interior_info',
          'propertyInformation.commercial_construction_info',
          'phases',
          'branch',
        ],
      });
      return customBuilder;
    } catch (error: any) {
      console.log('Error retrieving Custom Builder', error.message);
      console.log('Error stack', error.stack);
      throw error;
    }
  }


  async findMinimalByUserId(userId: string) {
    try {
      const customBuilder = await this.customBuilderRepository.find({
        where: { customer: { id: (userId) } },
        relations: [
          'customer',
          'propertyInformation',
          'propertyInformation.house_construction_info',
          'propertyInformation.interior_info',
          'propertyInformation.commercial_construction_info',
          'phases',
          'branch',
        ],
      });

      const result = customBuilder.map((builder) => {
        const propertyInfo = builder?.propertyInformation;
        const isCommercial = propertyInfo?.construction_type === 'Commercial';
        const totalArea =
          propertyInfo?.construction_scope === ConstructionScope.Interior
            ? propertyInfo?.interior_info?.total_area
            : isCommercial
              ? propertyInfo?.commercial_construction_info?.total_area
              : propertyInfo?.house_construction_info?.total_area;

        return {
          id: builder.id,
          currentDay: builder.currentDay,
          estimatedDays: builder.estimatedDays,
          firstName: builder.customer?.firstName,
          email: builder.customer?.email,
          total_area: totalArea,
          propertyName: propertyInfo?.propertyName,
          phases: builder.phases,
          branchId: (builder as any).branch?.id,
        };
      });
      return result;
    } catch (error: any) {
      console.log('Error retrieving Custom Builder', error.message);
      console.log('Error stack', error.stack);
      throw error;
    }
  }


  async findById(id: string): Promise<CustomBuilder> {
    try {
      const customBuilder = await this.customBuilderRepository.findOne({
        where: { id },
        relations: [
          'documents',
          'customer',
          'propertyInformation',
          'servicesRequired',
          'logs',
          'phases',
          'location',
          'propertyInformation.house_construction_info',
          'propertyInformation.interior_info',
          'propertyInformation.commercial_construction_info',
          'branch',
          'createdByUser',
        ],
      });
      if (customBuilder) return customBuilder;
      throw new BadRequestException('Custom Builder not found');
    } catch (error: any) {
      console.log('Error retrieving Custom Builder', error.message);
      console.log('Error stack', error.stack);
      throw error;
    }
  }


  async findByIdWithLogs(
    id: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: CustomBuilder;
    logs: DailyProgress[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const customBuilder = await this.customBuilderRepository.findOne({
        where: { id },
        relations: [
          'customer',
          'propertyInformation',
          'servicesRequired',
          'location',
          'phases',
          'propertyInformation.house_construction_info',
          'propertyInformation.interior_info',
          'propertyInformation.commercial_construction_info',
          'branch',
        ],
      });
      if (!customBuilder)
        throw new BadRequestException('Custom Builder not found');

      const [logs, total] = await this.customBuilderRepository.manager
        .getRepository(DailyProgress)
        .createQueryBuilder('progress')
        .where('progress.customBuilderId = :id', { id })
        .orderBy('progress.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return { data: customBuilder, logs, total, page, limit };
    } catch (error: any) {
      console.error(
        'Error retrieving Custom Builder with logs:',
        error.message,
      );
      throw error;
    }
  }


  async update(id: string, updatedData: UpdateCustomBuilderDto) {
    try {
      const customBuilder = await this.findById(id);
      if (!customBuilder)
        throw new BadRequestException('Custom Builder not found');

      const merged = Object.assign(customBuilder, updatedData);
      await this.customBuilderRepository.save(merged);

      const customer = await this.userRepository.findOne({
        where: { id: customBuilder.customer?.id },
      });

      const documentTabs = [
        'costEstimation',
        'agreement',
        'paymentReports',
        'weeklyReports',
        'monthlyReports',
        'warranty',
        'bills',
        'floorPlans',
      ] as const;

      for (const tab of documentTabs) {
        if ((updatedData as any)[tab] && (updatedData as any)[tab].length > 0) {
          const capitalizedTab =
            tab[0].toUpperCase() + tab.slice(1).toLowerCase();
          if (customer?.id) {
            await this.notificationService.createNotification({
              userId: customer.id,
              message: `Your ${capitalizedTab} document uploaded successfully.`,
            });
            if (customer.email) {
              const emailTemplate = generateDocumentUploadTemplate(
                capitalizedTab,
                customer.fullName || 'User',
              );
              await this.notificationService.sendEmailNotification({
                email: customer.email,
                template: emailTemplate,
              });
            }
          }
          break;
        }
      }

      return { message: `Custom Builder ${id} updated successfully` };
    } catch (error: any) {
      console.log('Error updating Custom Builder', error.message);
      console.log('Error stack', error.stack);
      throw error;
    }
  }


  async deleteById(id: string) {
    try {
      const customBuilder = await this.findById(id);
      if (!customBuilder)
        throw new BadRequestException('Custom Builder not found');

      await this.customBuilderRepository.remove(customBuilder);
      return { message: `Custom Builder with id ${id} deleted successfully` };
    } catch (error: any) {
      console.log('Error deleting Custom Builder', error.message);
      console.log('Error stack', error.stack);
      throw error;
    }
  }
}
