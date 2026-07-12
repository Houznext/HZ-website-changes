import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import {
  CreateCostEstimatorDto,
  UpdateCostEstimatorDto,
} from './dto/cost-estimator.dto';
import { CostEstimator } from './entities/cost-estimator.entity';
import { NotificationService } from '../notifications/notification.service';
import { User } from 'src/user/entities/user.entity';
import { instanceToPlain } from 'class-transformer';
import { ItemGroup } from './entities/itemgroup.entity';
import { UserRole } from 'src/user/enum/user.enum';
import { EstimationCategory } from './Enum/cost-estimator.enum';
import { MailerService } from 'src/sendEmail.service';
import { RequestUser } from 'src/guard';
import { S3Service } from 'src/common/s3/s3.service';
import { mobileSuffix10, sqlMobileSuffixMatch } from 'src/common/phone.util';

@Injectable()
export class CostEstimatorService {
  constructor(
    @InjectRepository(CostEstimator)
    private readonly costEstimatorRepository: Repository<CostEstimator>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private notificationService: NotificationService,
    private readonly mailerService: MailerService,
    private readonly s3Service: S3Service,
  ) {}

  async create(createCostEstimatorDto: CreateCostEstimatorDto): Promise<any> {
    try {
      let user = await this.userRepository.findOne({
        where: { id: createCostEstimatorDto.userId },
      });

      if (!user) {
        user = await this.userRepository.findOne({
          where: { role: UserRole.ADMIN },
        });
        if (!user) {
          throw new BadRequestException(
            'User not found, cannot create estimation',
          );
        }
      }

      const category =
        createCostEstimatorDto.category || EstimationCategory.INTERIOR;

      const costEstimator = this.costEstimatorRepository.create({
        ...createCostEstimatorDto,
        postedBy: user,
        category,
      });

      if (
        createCostEstimatorDto.itemGroups &&
        createCostEstimatorDto.itemGroups.length > 0
      ) {
        costEstimator.itemGroups = createCostEstimatorDto.itemGroups.map(
          (groupDto) => {
            const itemGroup = new ItemGroup();
            itemGroup.title = groupDto.title;
            itemGroup.items = groupDto.items;
            return itemGroup;
          },
        );
      }

      const savedEstimator =
        await this.costEstimatorRepository.save(costEstimator);

      // Do not await — SMTP timeouts on Railway were blocking duplicate/save for ~20s+.
      this.mailerService.enqueue(
        this.mailerService.notifyAdminsQuotationCreated({
          id: savedEstimator.id,
          quotationNumber: savedEstimator.quotationNumber,
          customerFirstName: savedEstimator.firstname,
          customerLastName: savedEstimator.lastname,
          customerEmail: savedEstimator.email,
          customerPhone: savedEstimator.customerMobile || savedEstimator.phone,
          subTotal: Number(savedEstimator.subTotal),
          postedByName: user.fullName || user.username,
        }),
        'quotation created notify',
      );

      // ✅ This removes all circular refs before returning
      return instanceToPlain(savedEstimator);
    } catch (error) {
      console.error('Error creating CostEstimator:', error);
      throw error;
    }
  }

  async findAll(
    firstname?: string,
    lastname?: string,
    email?: string,
    phone?: number | null,
    customerMobile?: string,
    property_name?: string,
    bhk?: string,
    city?: string,
    state?: string,
    pincode?: string,
    landmark?: string,
    locality?: string,
    page: number = 1,
    limit: number = 10,
    category?: EstimationCategory,
  ) {
    try {
      const queryBuilder = this.costEstimatorRepository
        .createQueryBuilder('costEstimator')
        .leftJoinAndSelect('costEstimator.postedBy', 'postedBy');

      if (firstname) {
        queryBuilder.andWhere('costEstimator.firstname ILIKE :firstname', {
          firstname: `%${firstname}%`,
        });
      }

      if (lastname) {
        queryBuilder.andWhere('costEstimator.lastname ILIKE :lastname', {
          lastname: `%${lastname}%`,
        });
      }

      if (email) {
        queryBuilder.andWhere('costEstimator.email ILIKE :email', {
          email: `%${email}%`,
        });
      }

      if (phone) {
        queryBuilder.andWhere('costEstimator.phone = :phone', { phone });
      }

      if (customerMobile) {
        const suffix = mobileSuffix10(customerMobile);
        queryBuilder.andWhere(sqlMobileSuffixMatch('costEstimator.customerMobile'), {
          mobileSuffix: suffix,
        });
      }

      if (property_name) {
        queryBuilder.andWhere(
          'costEstimator.property_name ILIKE :property_name',
          { property_name: `%${property_name}%` },
        );
      }

      if (bhk) {
        queryBuilder.andWhere('costEstimator.bhk = :bhk', { bhk });
      }

      if (city) {
        queryBuilder.andWhere("costEstimator.location ->> 'city' ILIKE :city", {
          city: `%${city}%`,
        });
      }

      if (state) {
        queryBuilder.andWhere(
          "costEstimator.location ->> 'state' ILIKE :state",
          {
            state: `%${state}%`,
          },
        );
      }

      if (pincode) {
        queryBuilder.andWhere(
          "costEstimator.location ->> 'pincode' = :pincode",
          {
            pincode,
          },
        );
      }

      if (landmark) {
        queryBuilder.andWhere(
          "costEstimator.location ->> 'landmark' ILIKE :landmark",
          {
            landmark: `%${landmark}%`,
          },
        );
      }
      if (category) {
        queryBuilder.andWhere('costEstimator.category = :category', {
          category,
        });
      }

      if (locality) {
        queryBuilder.andWhere(
          "costEstimator.location ->> 'locality' ILIKE :locality",
          {
            locality: `%${locality}%`,
          },
        );
      }
      const [costEstimators, total] = await queryBuilder
        .orderBy('costEstimator.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return {
        data: costEstimators.map((e) => ({
          ...e,
          displayQuotationNumber: this.formatQuotationNumber(e.quotationNumber),
        })),
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error retrieving CostEstimators:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<CostEstimator> {
    try {
      const query = await this.costEstimatorRepository
        .createQueryBuilder('costEstimator')
        .leftJoinAndSelect('costEstimator.postedBy', 'postedBy')
        .leftJoinAndSelect('costEstimator.itemGroups', 'itemGroups')
        .where('costEstimator.id = :id', { id })
        .orderBy('itemGroups.order', 'ASC');
      const costEstimator = await query.getOne();

      if (!costEstimator) {
        throw new NotFoundException(`CostEstimator with ID ${id} not found`);
      }

      return {
        ...costEstimator,
        displayQuotationNumber: this.formatQuotationNumber(
          costEstimator.quotationNumber,
        ),
      } as any;
    } catch (error) {
      console.error(`Error retrieving CostEstimator with ID ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, updateDto: UpdateCostEstimatorDto): Promise<any> {
    const existingEstimator = await this.costEstimatorRepository.findOne({
      where: { id },
      relations: ['itemGroups', 'postedBy'],
    });

    if (!existingEstimator) {
      throw new NotFoundException(`Estimator with ID ${id} not found.`);
    }

    // When file URLs are changed, delete old files from S3
    if (updateDto.property_image !== undefined && existingEstimator.property_image && updateDto.property_image !== existingEstimator.property_image) {
      try {
        await this.s3Service.deleteFileByUrl(existingEstimator.property_image);
      } catch (err) {
        console.warn('Failed to delete old cost-estimator property_image from S3:', err);
      }
    }
    if (updateDto.floor_plan !== undefined && existingEstimator.floor_plan && updateDto.floor_plan !== existingEstimator.floor_plan) {
      try {
        await this.s3Service.deleteFileByUrl(existingEstimator.floor_plan);
      } catch (err) {
        console.warn('Failed to delete old cost-estimator floor_plan from S3:', err);
      }
    }

    Object.assign(existingEstimator, updateDto);
    if (Array.isArray(updateDto.itemGroups)) {
      const existingGroupsMap = new Map<number, ItemGroup>();
      existingEstimator.itemGroups.forEach((group) => {
        if (group.id) existingGroupsMap.set(group.id, group);
      });

      const updatedGroups: ItemGroup[] = [];

      for (const groupDto of updateDto.itemGroups) {
        if (groupDto.id && existingGroupsMap.has(groupDto.id)) {
          const existingGroup = existingGroupsMap.get(groupDto.id);
          existingGroup.title = groupDto.title;
          existingGroup.items = groupDto.items;
          existingGroup.order = groupDto.order ?? 0;
          updatedGroups.push(existingGroup);
          existingGroupsMap.delete(groupDto.id);
        } else {
          const newGroup = new ItemGroup();
          newGroup.title = groupDto.title;
          newGroup.order = groupDto.order ?? 0;
          newGroup.items = groupDto.items;
          updatedGroups.push(newGroup);
        }
      }

      for (const [id, group] of existingGroupsMap) {
        await this.costEstimatorRepository.manager.remove(group);
      }

      existingEstimator.itemGroups = updatedGroups;
    }

    const savedEstimator =
      await this.costEstimatorRepository.save(existingEstimator);

    this.mailerService.enqueue(
      this.mailerService.notifyAdminsQuotationUpdated({
        id: savedEstimator.id,
        quotationNumber: savedEstimator.quotationNumber,
        customerFirstName: savedEstimator.firstname,
        customerLastName: savedEstimator.lastname,
        customerEmail: savedEstimator.email,
        customerPhone: savedEstimator.customerMobile || savedEstimator.phone,
        subTotal: Number(savedEstimator.subTotal),
        postedByName:
          existingEstimator.postedBy?.fullName ||
          existingEstimator.postedBy?.username ||
          null,
      }),
      'quotation updated notify',
    );

    const { itemGroups, ...rest } = savedEstimator;
    return {
      ...rest,
      itemGroups: itemGroups?.map(({ costEstimator, ...group }) => group),
    };
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const costEstimator = await this.costEstimatorRepository.findOne({
        where: { id },
        relations: ['postedBy'],
      });

      if (!costEstimator) {
        throw new BadRequestException(`Estimation not found with id: ${id}`);
      }
      const deletedBy = await this.userRepository.findOne({
        where: { id: userId },
      });

      const token = randomBytes(24).toString('hex');
      await this.costEstimatorRepository.update(id, {
        restoreToken: token,
        deletedById: userId || null,
      });
      await this.costEstimatorRepository.softDelete(id);

      const restoreUrl = this.mailerService.buildQuotationRestoreUrl(id, token);
      const formattedDate = new Date().toLocaleString();

      try {
        const superAdmins = await this.userRepository.find({
          where: { role: UserRole.ADMIN },
        });

        await Promise.all(
          superAdmins.map((admin) =>
            this.notificationService.createNotification({
              userId: admin.id,
              message: `CostEstimator ${costEstimator.firstname}  ID ${id} was deleted by ${deletedBy?.username} (ID: ${deletedBy?.id}) on ${formattedDate}.`,
            }),
          ),
        );

        this.mailerService.enqueue(
          this.mailerService.notifyAdminsAboutDeletion({
            deletedEstimatorId: id,
            deletedBy: {
              id: deletedBy?.id || userId,
              username: deletedBy?.username || deletedBy?.email || 'admin',
            },
            estimatorFirstName: [costEstimator.firstname, costEstimator.lastname]
              .filter(Boolean)
              .join(' '),
            restoreUrl,
            details: {
              'Quotation #':
                costEstimator.quotationNumber != null
                  ? `QT-${String(costEstimator.quotationNumber).padStart(4, '0')}`
                  : '—',
              Email: costEstimator.email,
              Phone: costEstimator.customerMobile || costEstimator.phone || '—',
              Subtotal: `₹${Number(costEstimator.subTotal || 0).toLocaleString('en-IN')}`,
            },
          }),
          'quotation deleted notify',
        );
      } catch (notifyErr) {
        console.error(
          `Quotation ${id} soft-deleted but notify/email failed:`,
          notifyErr instanceof Error ? notifyErr.message : notifyErr,
        );
      }

      console.log(`CostEstimator with ID ${id} soft-deleted successfully`);
    } catch (error) {
      console.error(`Error deleting CostEstimator with ID ${id}:`, error);
      throw error;
    }
  }

  async restoreWithToken(id: string, token: string): Promise<CostEstimator> {
    if (!token?.trim()) {
      throw new BadRequestException('Restore token is required');
    }
    const row = await this.costEstimatorRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!row || !row.deletedAt) {
      throw new NotFoundException('Deleted quotation not found');
    }
    if (!row.restoreToken || row.restoreToken !== token.trim()) {
      throw new ForbiddenException('Invalid restore token');
    }
    await this.costEstimatorRepository.restore(id);
    await this.costEstimatorRepository.update(id, {
      restoreToken: null,
      deletedById: null,
    });
    const restored = await this.costEstimatorRepository.findOne({ where: { id } });
    if (!restored) throw new NotFoundException('Quotation not found after restore');
    return restored;
  }

  async sendEmail(email: string) {
    try {
      const notification = {
        email,
        message:
          'We are pleased to inform you that our team has completed the cost estimation for your project. Our designer has carefully reviewed your project requirements and have provided a detailed estimate of the costs involved.',
      };

      await this.notificationService.sendEmailNotification(notification);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new InternalServerErrorException('Unable to send email');
    }
  }

  async fetchEstimationsByUser(
    _currentUser: RequestUser | null,
    filters: {
      firstname?: string;
      lastname?: string;
      email?: string;
      phone?: number;
      customerMobile?: string;
      property_name?: string;
      bhk?: string;
      city?: string;
      state?: string;
      pincode?: string;
      landmark?: string;
      locality?: string;
      category?: EstimationCategory;
    },
    page = 1,
    limit = 10,
    _branchId?: string,
    targetUserId?: string,
  ) {
    const queryBuilder = this.costEstimatorRepository
      .createQueryBuilder('costEstimator')
      .leftJoinAndSelect('costEstimator.postedBy', 'postedBy');

    if (targetUserId) {
      queryBuilder.andWhere('costEstimator.postedById = :uid', {
        uid: targetUserId,
      });
    }

    

    if (filters.firstname) {
      queryBuilder.andWhere('costEstimator.firstname ILIKE :firstname', {
        firstname: `%${filters.firstname}%`,
      });
    }

    if (filters.lastname) {
      queryBuilder.andWhere('costEstimator.lastname ILIKE :lastname', {
        lastname: `%${filters.lastname}%`,
      });
    }

    if (filters.email) {
      queryBuilder.andWhere('costEstimator.email ILIKE :email', {
        email: `%${filters.email}%`,
      });
    }

    if (filters.phone) {
      queryBuilder.andWhere('costEstimator.phone = :phone', {
        phone: filters.phone,
      });
    }

    if (filters.customerMobile) {
      const suffix = mobileSuffix10(filters.customerMobile);
      queryBuilder.andWhere(sqlMobileSuffixMatch('costEstimator.customerMobile'), {
        mobileSuffix: suffix,
      });
    }

    if (filters.property_name) {
      queryBuilder.andWhere(
        'costEstimator.property_name ILIKE :property_name',
        {
          property_name: `%${filters.property_name}%`,
        },
      );
    }

    if (filters.bhk) {
      queryBuilder.andWhere('costEstimator.bhk = :bhk', { bhk: filters.bhk });
    }

    if (filters.city) {
      queryBuilder.andWhere("costEstimator.location ->> 'city' ILIKE :city", {
        city: `%${filters.city}%`,
      });
    }

    if (filters.state) {
      queryBuilder.andWhere("costEstimator.location ->> 'state' ILIKE :state", {
        state: `%${filters.state}%`,
      });
    }

    if (filters.pincode) {
      queryBuilder.andWhere("costEstimator.location ->> 'pincode' = :pincode", {
        pincode: filters.pincode,
      });
    }

    if (filters.landmark) {
      queryBuilder.andWhere(
        "costEstimator.location ->> 'landmark' ILIKE :landmark",
        { landmark: `%${filters.landmark}%` },
      );
    }

    if (filters.locality) {
      queryBuilder.andWhere(
        "costEstimator.location ->> 'locality' ILIKE :locality",
        { locality: `%${filters.locality}%` },
      );
    }

    if (filters.category) {
      queryBuilder.andWhere('costEstimator.category = :category', {
        category: filters.category,
      });
    }

    const [results, total] = await queryBuilder
      .orderBy('costEstimator.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: results,
      total,
      page,
      limit,
    };
  }

  private formatQuotationNumber(num: number | null): string | null {
    if (!num) return null;
    return `QT-${String(num).padStart(4, '0')}`;
  }
}
