import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyLead } from './property-lead.entity';
import { Property } from '../entities/property.entity';
import { CreateContactSellerDto } from '../dto/property-lead.dto';
import { MailerService } from 'src/sendEmail.service';
import { SmsService } from 'src/sms.service';
import { NotificationService } from 'src/notifications/notification.service';
import { Project } from 'src/company-onboarding/entities/company-projects.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class PropertyLeadService {
  constructor(
    @InjectRepository(PropertyLead)
    private leadRepo: Repository<PropertyLead>,
    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService,
    private readonly smsService: SmsService,
    private readonly notificationService: NotificationService,
  ) {}

  async createLead(dto: CreateContactSellerDto): Promise<PropertyLead> {
    let property = null;
    let project = null;
    if (dto.isProject) {
      project = await this.projectRepo.findOne({
        where: { id: dto.propertyId },
        relations: ['company'],
      });
      if (!project) throw new Error('Project not found');
    } else {
      property = await this.propertyRepo.findOne({
        where: { propertyId: dto.propertyId },
        relations: ['postedByUser', 'propertyDetails'],
      });
      if (!property) throw new Error('Property not found');
    }

    const lead = this.leadRepo.create({
      name: dto.name,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      agreeToContact: dto.agreeToContact,
      interestedInLoan: dto.interestedInLoan,
      property,
      project,
    });
    const savedLead = await this.leadRepo.save(lead);
    if (property && property.postedByUser) {
      const owner = property.postedByUser;
      if (owner && owner.email) {
        await this.mailerService.sendLeadNotificationToOwner(
          savedLead,
          property,
          owner,
        );
      }
      if (owner) {
        const message = `Hi ${owner?.fullName}, new enquiry on your "${property.propertyDetails?.propertyName}" from ${lead.name}, ${lead.phoneNumber}`;

        await this.notificationService.createNotification({
          userId: owner?.id,
          message,
        });
      }
      // if (owner?.phone) {
      //   const smsMessage = `Hi ${owner?.fullName}, new enquiry on "${property.propertyDetails?.propertyName}" from ${lead.name}, ${lead.phoneNumber}`;
      //   await this.smsService.sendSms(owner?.phone, smsMessage);
      // }
    }

    if (project && project.company) {
      const company = project.company;

      if (company.email) {
        await this.mailerService.sendLeadNotificationToOwner(
          savedLead,
          project,
          {
            email: company.email,
            fullName: company.name,
            id: company.id,
          } as any,
        );
      }

      const companyUsers = await this.userRepository.find({
        where: { company: { id: company.id } },
      });

      for (const user of companyUsers) {
        const message = `Hi ${user.fullName}, new enquiry on your project "${project.Name}" from ${lead.name}, ${lead.phoneNumber}`;

        await this.notificationService.createNotification({
          userId: user.id,
          message,
        });

        // if (user.phone) {
        //   await this.smsService.sendSms(user.phone, message);
        // }
      }
    }
    return savedLead;
  }

   async getLeads(id: string, isProject = false): Promise<PropertyLead[]> {
    if (isProject) {
      return this.leadRepo.find({
        where: { project: { id } },
       
      });
    } else {
      return this.leadRepo.find({
        where: { property: { propertyId: id } },
       
      });
    }
  }
}
