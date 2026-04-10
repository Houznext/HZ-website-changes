import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactUs } from './entities/contact-us.entity';
import { CreateContactUsDto, UpdateContactUsDto } from './dto/contact-us.dto';
import { In, Between } from 'typeorm';
import { NotificationService } from 'src/notifications/notification.service';
import { MailerService } from 'src/sendEmail.service';
import { User } from 'src/user/entities/user.entity';
import { UserRole } from 'src/user/enum/user.enum';
import { USER_NOTIFICATION_TEMPLATE } from '../emailTemplates';
import { SmsService } from 'src/sms.service';
import { WhatsAppMsgService } from 'src/whatsApp.service';
import {
  HOUZNEXT_COMPANY_NAME,
  HOUZNEXT_PUBLIC_EMAIL,
  HOUZNEXT_PUBLIC_PHONE_DISPLAY,
} from 'src/common/houznext-public-contact';
@Injectable()
export class ContactUsService {
  constructor(
    @InjectRepository(ContactUs)
    private readonly contactUsRepo: Repository<ContactUs>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
    private readonly mailerService: MailerService,
    private readonly smsService: SmsService,
    private readonly whatsAppMsgService: WhatsAppMsgService,
  ) {}
  async create(dto: CreateContactUsDto): Promise<ContactUs> {
    const newContact = this.contactUsRepo.create({
      ...dto,
    });

    const savedContact = await this.contactUsRepo.save(newContact);

    // Side effects (email, SMS, in-app notifications) must not fail the API:
    // local/dev often has no SMTP creds; notification DB issues should not block lead capture.
    try {
      if (savedContact.assignedTo) {
        await this.mailerService.sendUserNotification(
          savedContact.assignedTo,
          `Welcome to ${HOUZNEXT_COMPANY_NAME}!`,
          USER_NOTIFICATION_TEMPLATE,
        );
      }
      const formattedDate = savedContact?.createdAt.toLocaleString('default', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const superAdmins = await this.userRepository.find({
        where: { role: UserRole.ADMIN },
      });
      await Promise.all(
        superAdmins.map((admin) =>
          this.notificationService.createNotification({
            userId: admin.id,
            message: `New contact is created ${
              savedContact?.firstName || savedContact?.emailAddress
            }  on ${formattedDate}.`,
          }),
        ),
      );

      // WhatsApp lead alert to business line (UltraMsg: number must be allowed in UltraMsg dashboard)
      try {
        const raw =
          process.env.CONTACT_LEAD_WHATSAPP_TO || '919759750770';
        const digits = raw.replace(/\D/g, '');
        const adminWaTo =
          digits.length === 10
            ? `91${digits}`
            : digits.startsWith('91')
              ? digits
              : digits;
        const adminLeadMsg =
          `*New Houznext — Contact / hero form*\n\n` +
          `*Name:* ${savedContact.firstName} ${savedContact.lastName}\n` +
          `*Phone:* +91 ${savedContact.contactNumber}\n` +
          `*Email:* ${savedContact.emailAddress}\n` +
          `*Service:* ${savedContact.serviceType || '—'}\n` +
          `*City:* ${savedContact.city || '—'}\n` +
          `*Details:* ${(savedContact.tellUsMore || '—').slice(0, 800)}`;
        await this.whatsAppMsgService.sendMessage(adminWaTo, adminLeadMsg);
      } catch (e) {
        console.error('Failed to WhatsApp new lead to admin:', e?.message);
      }

      if (savedContact.assignedTo) {
        const message = `New Contact is Created ${savedContact?.firstName} and phone number is ${savedContact?.contactNumber} on ${formattedDate}`;

        await this.notificationService.createNotification({
          userId: savedContact.assignedTo.id,
          message,
        });
      }
      if (savedContact.contactNumber) {
        try {
          const smsMessage = `Hi ${savedContact.firstName}, thank you for reaching out to ${HOUZNEXT_COMPANY_NAME}! Our team will contact you within 24 hours. For urgent queries, call ${HOUZNEXT_PUBLIC_PHONE_DISPLAY} or email ${HOUZNEXT_PUBLIC_EMAIL}. - ${HOUZNEXT_COMPANY_NAME}`;
          await this.smsService.sendSms(savedContact.contactNumber, smsMessage);
        } catch (e) {
          console.error('Failed to send confirmation SMS:', e?.message);
        }
      }

      if (savedContact.contactNumber) {
        try {
          const waMessage = `Hi ${savedContact.firstName}! 👋\n\nThank you for contacting *${HOUZNEXT_COMPANY_NAME}*. We've received your inquiry${savedContact.serviceType ? ` regarding *${savedContact.serviceType}*` : ''}.\n\nOur team will reach out to you within 24 hours.\n\nFor urgent queries: ${HOUZNEXT_PUBLIC_PHONE_DISPLAY}\n${HOUZNEXT_PUBLIC_EMAIL}\n\n— Team ${HOUZNEXT_COMPANY_NAME}`;
          await this.whatsAppMsgService.sendMessage(
            `91${savedContact.contactNumber}`,
            waMessage,
          );
        } catch (e) {
          console.error('Failed to send confirmation WhatsApp:', e?.message);
        }
      }

      await this.mailerService.notifyAdminsAboutContactLead(savedContact);
    } catch (e) {
      console.error(
        'ContactUs create: post-save notifications/email failed (lead was saved):',
        e?.message || e,
      );
    }

    return savedContact;
  }

  async findAll(): Promise<ContactUs[]> {
    return this.contactUsRepo.find();
  }
  async findContactsByUser(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ContactUs[]> {
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

    return this.contactUsRepo.find({
      where: whereCondition,
      relations: ['assignedTo', 'assignedBy'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ContactUs> {
    const contact = await this.contactUsRepo.findOne({ where: { id } });
    if (!contact)
      throw new NotFoundException(`Contact with ID ${id} not found`);
    return contact;
  }
  async update(id: string, dto: UpdateContactUsDto): Promise<ContactUs> {
    const contact = await this.findOne(id);
    Object.assign(contact, dto);
    return this.contactUsRepo.save(contact);
  }
  async remove(id: string): Promise<void> {
    const contact = await this.findOne(id);
    await this.contactUsRepo.remove(contact);
  }
  async deleteMoreLeads(ids: string[]): Promise<void> {
    const contacts = await this.contactUsRepo.findBy({
      id: In(ids),
    });

    if (contacts.length !== ids.length) {
      throw new NotFoundException('Some  contacts were not found.');
    }

    await this.contactUsRepo.delete(ids);
  }
  async assignLeadToUser(
    contactId: string,
    assignedToId: string, 
  ) {
    const contact = await this.contactUsRepo.findOne({
      where: { id: contactId },
      relations: ['assignedTo', 'assignedBy'],
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    const assignedUser = await this.userRepository.findOne({
      where: { id: assignedToId },
    });
    if (!assignedUser) {
      throw new NotFoundException('Assigned user not found');
    }

    const adminUser = await this.userRepository.findOne({
      where: { id: contact.assignedBy?.id },
    });
    if (!adminUser) {
      throw new NotFoundException('Admin user not found');
    }

    contact.assignedTo = assignedUser;
    contact.assignedBy = adminUser;

    await this.contactUsRepo.save(contact);

    await this.notificationService.createNotification({
      userId: assignedUser.id,
      message: `You have been assigned a new contact lead: ${contact.firstName} ${contact.lastName}`,
    });

    await this.notificationService.createNotification({
      userId: adminUser.id,
      message: `You assigned ${contact.firstName} ${contact.lastName} to ${assignedUser.fullName}`,
    });

    return {
      ...contact,
      assignedTo: assignedUser.fullName,
      assignedBy: adminUser.fullName,
    };
  }
}
