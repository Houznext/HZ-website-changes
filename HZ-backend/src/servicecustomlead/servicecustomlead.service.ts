import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryFailedError } from 'typeorm';
import { ServiceCustomLead } from './entities/servicecustomlead.entity';
import { User } from 'src/user/entities/user.entity';
import { MailerService } from 'src/sendEmail.service';
import { USER_NOTIFICATION_TEMPLATE } from '../emailTemplates';
import { UserRole } from 'src/user/enum/user.enum';
import { In, Between } from 'typeorm';
import {
  CreateServiceCustomLeadDto,
  UpdateServiceCustomLeadstatusDto,
} from './dto/servicecustomlead.dto';
@Injectable()
export class ServiceCustomLeadService {
  constructor(
    @InjectRepository(ServiceCustomLead)
    private servicecustomleadRepository: Repository<ServiceCustomLead>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly mailerService: MailerService,
  ) {}
  async create(
    createServiceCustomLeadDto: CreateServiceCustomLeadDto,
  ): Promise<ServiceCustomLead> {
    const { name, phonenumber, description, serviceType, solarQuote } =
      createServiceCustomLeadDto;

    // Solar: duplicate = same name + phone + serviceType. Others: same name + phone + description + serviceType.
    const isSolar = String(serviceType).toLowerCase() === 'solar';
    const existingLead = isSolar
      ? await this.servicecustomleadRepository.findOne({
          where: { name, phonenumber, serviceType },
        })
      : await this.servicecustomleadRepository.findOne({
          where: { name, phonenumber, description, serviceType },
        });

    if (existingLead) {
      throw new ConflictException({
        message: 'A lead with the provided details already exists.',
        existingLead,
      });
    }

    try {
      const { solarQuote: _sq, monthlyBill, ...rest } = createServiceCustomLeadDto;
      const toSave: Partial<ServiceCustomLead> = {
        ...rest,
        monthlyBill: monthlyBill != null ? String(monthlyBill) : undefined,
        solarQuoteSnapshot: solarQuote ?? undefined,
      };
      const createdLead = await this.servicecustomleadRepository.save(
        toSave as ServiceCustomLead,
      );
      if (createdLead.assignedTo) {
        await this.mailerService.sendUserNotification(
          createdLead.assignedTo,
          'Welcome to OneCasa!',
          USER_NOTIFICATION_TEMPLATE,
        );
      }
      await this.mailerService.notifyAdminsAboutServiceLead(createdLead);
      return createdLead;
    } catch (err) {
      const isUniqueViolation =
        err instanceof QueryFailedError &&
        (err as any).code === '23505';
      if (isUniqueViolation) {
        const existingByName = await this.servicecustomleadRepository.findOne({
          where: { name },
        });
        if (existingByName) {
          throw new ConflictException({
            message: 'A lead with the provided details already exists.',
            existingLead: existingByName,
          });
        }
      }
      throw err;
    }
  }

  async findAll(): Promise<ServiceCustomLead[]> {
    return await this.servicecustomleadRepository.find();
  }
   async findLeadsByUser(
      userId: string,
      startDate?: string,
      endDate?: string,
    ): Promise<ServiceCustomLead[]> {
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
        whereCondition.state = In(user.states);
      }
  
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
  
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          throw new BadRequestException(
            'Invalid date format. Please use YYYY-MM-DD',
          );
        }
  
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
  
        whereCondition.createdAt = Between(start, end);
      }
  
      return this.servicecustomleadRepository.find({
        where: whereCondition,
        relations: ['assignedTo', 'assignedBy'],
        order: { id: 'DESC' },
      });
    }

  async findOne(id: string): Promise<ServiceCustomLead> {
    const ServiceCustomData = await this.servicecustomleadRepository.findOne({
      where: { id },
    });
    if (!ServiceCustomData) {
      throw new NotFoundException(
        `Service Custom data with ID ${id} not found`,
      );
    }
    return ServiceCustomData;
  }

  async remove(id: string): Promise<void> {
    await this.servicecustomleadRepository.delete(id);
  }
   async deleteMoreLeads(ids: string[]): Promise<void> {
      const leads = await this.servicecustomleadRepository.findBy({
        id: In(ids),
      });
  
      if (leads.length !== ids.length) {
        throw new NotFoundException('Some  leads were not found.');
      }
  
      await this.servicecustomleadRepository.delete(ids);
    }
  async updateStatus(
    id: string,
    updateservicecustomleadstatusDto: UpdateServiceCustomLeadstatusDto,
  ): Promise<ServiceCustomLead> {
    const lead = await this.servicecustomleadRepository.findOne({
      where: { id },
    });
    if (!lead) {
      throw new NotFoundException('service Lead not found');
    }
    lead.leadstatus = updateservicecustomleadstatusDto.leadstatus;
    return await this.servicecustomleadRepository.save(lead);
  }
  async assignLeadToUser(
    leadId: string,
    assignedToId: string,
    assignedById: string,
  ) {
    const lead = await this.servicecustomleadRepository.findOne({
      where: { id: leadId },
      relations: ['assignedTo', 'assignedBy'],
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    const assignedUser = await this.userRepository.findOne({
      where: { id: assignedToId },
    });
    if (!assignedUser) {
      throw new Error('Assigned user not found');
    }

    const adminUser = await this.userRepository.findOne({
      where: { id: assignedById },
    });
    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    lead.assignedTo = assignedUser;
    lead.assignedBy = adminUser;

    await this.servicecustomleadRepository.save(lead);

    return {
      ...lead,
      assignedTo: assignedUser.fullName,
      assignedBy: adminUser.fullName,
    };
  }
}
