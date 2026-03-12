import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from '../notifications/notification.service';
import { User } from 'src/user/entities/user.entity';
import { UserRole } from 'src/user/enum/user.enum';
import {
  CreateInvoiceEstimatorDto,
  UpdateInvoiceEstimatorDto,
} from './dto/invoice-estimator.dto';
import { InvoiceEstimator } from './entities/invoice-estimator.entity';
import { CustomBuilder } from 'src/Custombuilder/entities/custom-builder.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { RequestUser } from 'src/guard';

@Injectable()
export class InvoiceEstimatorService {
  constructor(
    @InjectRepository(InvoiceEstimator)
    private readonly invoiceEstimatorRepository: Repository<InvoiceEstimator>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(CustomBuilder)
    private readonly customBuilderRepository: Repository<CustomBuilder>,

    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,

    private notificationService: NotificationService,
  ) { }

  async create(dto: CreateInvoiceEstimatorDto): Promise<InvoiceEstimator> {
    try {
      const { userId, customBuilderId, branchId } = dto;

      const adminUser = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!adminUser) throw new BadRequestException('Admin user not found');

      let branch: Branch | null = null;
      const normalizedBranchId = branchId && branchId.trim() !== '' ? branchId : null;
      if (normalizedBranchId) {
        branch = await this.branchRepository.findOne({
          where: { id: normalizedBranchId },
        });
        if (!branch) {
          throw new BadRequestException('Branch not found');
        }
      }

      let customBuilder: CustomBuilder | null = null;
      if (customBuilderId) {
        customBuilder = await this.customBuilderRepository.findOne({
          where: { id: customBuilderId },
        });
        if (!customBuilder) {
          throw new BadRequestException('Custom builder not found');
        }
      }

      const invoice = this.invoiceEstimatorRepository.create({
        ...dto,
        branchId: normalizedBranchId,
        customBuilder,
        postedBy: adminUser,
        branch,
      });

      return await this.invoiceEstimatorRepository.save(invoice);
    } catch (error) {
      console.error('Error creating InvoiceEstimator:', error);
      throw error;
    }
  }

  // 🔹 MAIN LIST WITH ROLE LOGIC
  async findAll(
    branchId?: string,
    billToName?: string,
    billToCity?: string,
    shipToCity?: string,
    invoiceNumber?: string,
    invoiceDate?: string,
    invoiceDue?: string,
    invoiceTerms?: string,
    page = 1,
    limit = 10,
  ) {
    const queryBuilder =
      this.invoiceEstimatorRepository.createQueryBuilder('invoice');

    if (billToName) {
      queryBuilder.andWhere('invoice.billToName ILIKE :billToName', {
        billToName: `%${billToName}%`,
      });
    }

    if (billToCity) {
      queryBuilder.andWhere('invoice.billToCity ILIKE :billToCity', {
        billToCity: `%${billToCity}%`,
      });
    }

    if (shipToCity) {
      queryBuilder.andWhere('invoice.shipToCity ILIKE :shipToCity', {
        shipToCity: `%${shipToCity}%`,
      });
    }

    if (invoiceNumber) {
      queryBuilder.andWhere('invoice.invoiceNumber ILIKE :invoiceNumber', {
        invoiceNumber: `%${invoiceNumber}%`,
      });
    }

    if (invoiceDate) {
      queryBuilder.andWhere('invoice.invoiceDate = :invoiceDate', {
        invoiceDate,
      });
    }

    if (invoiceDue) {
      queryBuilder.andWhere('invoice.invoiceDue = :invoiceDue', {
        invoiceDue,
      });
    }

    if (invoiceTerms) {
      queryBuilder.andWhere('invoice.invoiceTerms ILIKE :invoiceTerms', {
        invoiceTerms: `%${invoiceTerms}%`,
      });
    }

    const [results, total] = await queryBuilder
      .orderBy('invoice.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: results, total, page, limit };
  }

  async findById(id: string): Promise<InvoiceEstimator> {
    try {
      const invoice = await this.invoiceEstimatorRepository.findOne({
        where: { id },
        relations: ['postedBy', 'branch', 'customBuilder'],
      });
      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${id} not found`);
      }
      return invoice;
    } catch (error) {
      console.error(`Error retrieving invoice with ID ${id}:`, error);
      throw error;
    }
  }

  async update(
    id: string,
    updateInvoiceEstimatorDto: UpdateInvoiceEstimatorDto,
  ): Promise<InvoiceEstimator> {
    try {
      const invoice = await this.invoiceEstimatorRepository.findOne({
        where: { id },
        relations: ['postedBy', 'branch', 'customBuilder'],
      });

      if (!invoice) {
        throw new BadRequestException(`Invoice not found with ID: ${id}`);
      }

      const adminUser = await this.userRepository.findOne({
        where: { id: updateInvoiceEstimatorDto.userId },
      });

      if (!adminUser) {
        throw new BadRequestException(
          `User not found with ID: ${updateInvoiceEstimatorDto.userId}`,
        );
      }

      if (
        updateInvoiceEstimatorDto.branchId &&
        updateInvoiceEstimatorDto.branchId !== invoice.branchId
      ) {
        const branch = await this.branchRepository.findOne({
          where: { id: updateInvoiceEstimatorDto.branchId },
        });
        if (!branch) {
          throw new BadRequestException('Branch not found');
        }
        invoice.branch = branch;
        invoice.branchId = branch.id;
      }

      if (
        typeof updateInvoiceEstimatorDto.customBuilderId !== 'undefined' &&
        updateInvoiceEstimatorDto.customBuilderId !== invoice.customBuilderId
      ) {
        if (updateInvoiceEstimatorDto.customBuilderId === null) {
          invoice.customBuilder = null;
          invoice.customBuilderId = null;
        } else {
          const customBuilder = await this.customBuilderRepository.findOne({
            where: { id: updateInvoiceEstimatorDto.customBuilderId },
          });
          if (!customBuilder) {
            throw new BadRequestException('Custom builder not found');
          }
          invoice.customBuilder = customBuilder;
          invoice.customBuilderId = customBuilder.id;
        }
      }

      const updatedInvoice = Object.assign(invoice, {
        ...updateInvoiceEstimatorDto,
        postedBy: adminUser,
      });

      await this.invoiceEstimatorRepository.save(updatedInvoice);
      return updatedInvoice;
    } catch (error) {
      console.error(`Error updating invoice with ID ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const invoiceEstimator = await this.invoiceEstimatorRepository.findOne({
        where: { id },
        relations: ['postedBy'],
      });

      if (!invoiceEstimator) {
        throw new BadRequestException(`Estimation not found with id: ${id}`);
      }

      const user = await this.userRepository.findOne({
        where: { id: invoiceEstimator.postedBy.id },
        relations: ['invoiceEstimators'],
      });

      if (user) {
        user.invoiceEstimators = (user.invoiceEstimators || []).filter(
          (item) => item.id !== id,
        );
        await this.userRepository.save(user);
      }

      await this.invoiceEstimatorRepository.delete(id);

      console.log(`invoice with ID ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting InvoiceEstimator with ID ${id}:`, error);
      throw error;
    }
  }

  async sendEmail(email: string) {
    try {
      const notification = {
        email,
        message:
          'Thank you for requesting an invoice estimate. We have generated the estimate based on the provided project details.',
      };

      await this.notificationService.sendEmailNotification(notification);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new InternalServerErrorException('Unable to send email');
    }
  }

  async findByCustomBuilderId(
    customBuilderId: string,
  ): Promise<InvoiceEstimator[]> {
    const builder = await this.customBuilderRepository.findOne({
      where: { id: customBuilderId },
    });

    if (!builder) {
      throw new NotFoundException(
        `CustomBuilder with ID ${customBuilderId} not found`,
      );
    }

    return this.invoiceEstimatorRepository.find({
      where: { customBuilder: { id: customBuilderId } },
      order: { id: 'DESC' },
    });
  }

  // 🔹 NON-REGISTERED INVOICES, ALSO ROLE-AWARE
  async findInvoicesForNonExistingUsers(
    currentUser: RequestUser,
    filters: {
      billToName?: string;
      billToCity?: string;
      shipToCity?: string;
      invoiceNumber?: string;
      invoiceDate?: string;
      invoiceDue?: string;
      invoiceTerms?: string;
    },
    page = 1,
    limit = 10,
    branchId?: string,
    targetUserId?: string,
  ) {
    const isSuperAdmin = currentUser.role === UserRole.ADMIN;

    const isBranchHead = currentUser.branchMembership?.isBranchHead ?? false;

    const effectiveUserId =
      isSuperAdmin && isBranchHead && targetUserId
        ? targetUserId
        : currentUser.id;

    const user = await this.userRepository.findOne({
      where: { id: effectiveUserId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${effectiveUserId} not found`);
    }

    const queryBuilder =
      this.invoiceEstimatorRepository.createQueryBuilder('invoice');

    queryBuilder.andWhere('invoice.userId = :userId', {
      userId: effectiveUserId,
    });

    queryBuilder.andWhere('invoice.customBuilderId IS NULL');

    const effectiveBranchId =
      branchId ?? currentUser.branchMembership?.branchId;
    if (effectiveBranchId) {
      queryBuilder.andWhere('invoice.branchId = :branchId', {
        branchId: effectiveBranchId,
      });
    }

    if (filters.billToName) {
      queryBuilder.andWhere('invoice.billToName ILIKE :billToName', {
        billToName: `%${filters.billToName}%`,
      });
    }

    if (filters.billToCity) {
      queryBuilder.andWhere('invoice.billToCity ILIKE :billToCity', {
        billToCity: `%${filters.billToCity}%`,
      });
    }

    if (filters.shipToCity) {
      queryBuilder.andWhere('invoice.shipToCity ILIKE :shipToCity', {
        shipToCity: `%${filters.shipToCity}%`,
      });
    }

    if (filters.invoiceNumber) {
      queryBuilder.andWhere('invoice.invoiceNumber ILIKE :invoiceNumber', {
        invoiceNumber: `%${filters.invoiceNumber}%`,
      });
    }

    if (filters.invoiceDate) {
      queryBuilder.andWhere('invoice.invoiceDate = :invoiceDate', {
        invoiceDate: filters.invoiceDate,
      });
    }

    if (filters.invoiceDue) {
      queryBuilder.andWhere('invoice.invoiceDue = :invoiceDue', {
        invoiceDue: filters.invoiceDue,
      });
    }

    if (filters.invoiceTerms) {
      queryBuilder.andWhere('invoice.invoiceTerms ILIKE :invoiceTerms', {
        invoiceTerms: `%${filters.invoiceTerms}%`,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy('invoice.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }
}
