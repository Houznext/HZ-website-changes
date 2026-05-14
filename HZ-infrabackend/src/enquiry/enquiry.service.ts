import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InfraEnquiry } from './entities/infra-enquiry.entity';
import { InfraCRMLead } from '../crm/entities/infra-crm-lead.entity';
import { InfraProperty } from '../property/entities/infra-property.entity';
import { CreateEnquiryDto } from './dto/enquiry.dto';
import { InfraMailService } from '../common/mail/infra-mail.service';

@Injectable()
export class EnquiryService {
  constructor(
    @InjectRepository(InfraEnquiry)
    private readonly repo: Repository<InfraEnquiry>,
    @InjectRepository(InfraProperty)
    private readonly propRepo: Repository<InfraProperty>,
    private readonly dataSource: DataSource,
    private readonly mail: InfraMailService,
  ) {}

  async create(dto: CreateEnquiryDto): Promise<{ enquiry: InfraEnquiry; lead: InfraCRMLead }> {
    const property = await this.propRepo.findOne({ where: { propertyId: dto.propertyId } });
    if (!property) throw new NotFoundException('Property not found');
    if (!property.isApproved || !property.isActive) {
      throw new BadRequestException('Enquiries are only accepted for live listings');
    }

    const result = await this.dataSource.transaction(async (em) => {
      const enquiry = em.create(InfraEnquiry, {
        name: dto.name,
        phone: dto.phone,
        email: dto.email ?? null,
        message: dto.message ?? null,
        customerId: dto.customerId ?? null,
        property,
        status: 'pending',
      });
      await em.save(enquiry);

      const lead = em.create(InfraCRMLead, {
        name: dto.name,
        phone: dto.phone,
        email: dto.email ?? null,
        stage: 'new',
        property,
      });
      await em.save(lead);

      return { enquiry, lead };
    });

    void this.mail
      .sendPropertyEnquiryNotification({
        enquiryId: result.enquiry.enquiryId,
        name: result.enquiry.name,
        phone: result.enquiry.phone,
        email: result.enquiry.email,
        message: result.enquiry.message,
        propertyId: property.propertyId,
        propertyCode: property.propertyCode,
        propertyTitle: property.title,
        city: property.city,
        locality: property.locality,
      })
      .catch(() => undefined);

    return result;
  }

  async adminList(): Promise<
    {
      enquiryId: string;
      name: string;
      phone: string;
      email: string | null;
      message: string | null;
      status: string;
      createdAt: Date;
      propertyId: string | null;
      propertyTitle: string | null;
      propertyCode: string | null;
      city: string | null;
      locality: string | null;
    }[]
  > {
    const rows = await this.repo.find({
      relations: { property: true },
      order: { createdAt: 'DESC' },
    });
    return rows.map((e) => ({
      enquiryId: e.enquiryId,
      name: e.name,
      phone: e.phone,
      email: e.email,
      message: e.message,
      status: e.status,
      createdAt: e.createdAt,
      propertyId: e.property?.propertyId ?? null,
      propertyTitle: e.property?.title ?? null,
      propertyCode: e.property?.propertyCode ?? null,
      city: e.property?.city ?? null,
      locality: e.property?.locality ?? null,
    }));
  }
}
