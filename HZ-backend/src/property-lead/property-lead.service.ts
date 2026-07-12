import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyLead } from './property-lead.entity';
import { CreateContactSellerDto } from './dto/property-lead.dto';
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
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService,
    private readonly smsService: SmsService,
    private readonly notificationService: NotificationService,
  ) {}

  async createLead(dto: CreateContactSellerDto): Promise<PropertyLead> {
    const project = await this.projectRepo.findOne({
      where: { id: dto.propertyId },
      relations: ['company', 'company.developerInformation'],
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const lead = this.leadRepo.create({
      name: dto.name,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      agreeToContact: dto.agreeToContact,
      interestedInLoan: dto.interestedInLoan,
      project,
    });
    const savedLead = await this.leadRepo.save(lead);

    if (project.company) {
      const company = project.company;
      const developer = company.developerInformation;

      if (developer?.email) {
        await this.mailerService.sendLeadNotificationToOwner(
          savedLead,
          project.Name,
          {
            email: developer.email,
            fullName: company.companyName || developer.fullName,
          },
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
      }
    }
    return savedLead;
  }

  async getLeads(id: string): Promise<PropertyLead[]> {
    return this.leadRepo.find({
      where: { project: { id } },
    });
  }
}
