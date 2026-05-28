import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InfraEnquiry } from './entities/infra-enquiry.entity';
import { InfraProperty } from '../property/entities/infra-property.entity';
import { CreateEnquiryDto } from './dto/enquiry.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { InfraMailService } from '../common/mail/infra-mail.service';
import { CrmLeadService } from '../crm-lead/crm-lead.service';
import type { InfraCrmLead } from '../crm-lead/entities/infra-crm-lead.entity';
import { DEFAULT_ENQUIRY_STATUS } from './enquiry-status.constants';

@Injectable()
export class EnquiryService {
  constructor(
    @InjectRepository(InfraEnquiry)
    private readonly repo: Repository<InfraEnquiry>,
    @InjectRepository(InfraProperty)
    private readonly propRepo: Repository<InfraProperty>,
    private readonly dataSource: DataSource,
    private readonly mail: InfraMailService,
    private readonly crmLeads: CrmLeadService,
  ) {}

  async create(dto: CreateEnquiryDto): Promise<{ enquiry: InfraEnquiry; lead: InfraCrmLead }> {
    const property = await this.propRepo.findOne({ where: { propertyId: dto.propertyId } });
    if (!property) throw new NotFoundException('Property not found');
    if (!property.isApproved || !property.isActive) {
      throw new BadRequestException('Enquiries are only accepted for live listings');
    }

    let enquiry = this.repo.create({
      name: dto.name,
      phone: dto.phone,
      email: dto.email ?? null,
      message: dto.message ?? null,
      customerId: dto.customerId ?? null,
      property,
      status: DEFAULT_ENQUIRY_STATUS,
      source: 'website',
      crmLeadId: null,
      adminResponse: null,
    });
    enquiry = await this.repo.save(enquiry);

    const lead = await this.crmLeads.createFromEnquiry({
      fullName: dto.name,
      phone: dto.phone,
      email: dto.email ?? null,
      propertyId: property.propertyId,
    });

    enquiry.crmLeadId = lead.id;
    await this.repo.save(enquiry);

    void this.mail
      .sendPropertyEnquiryNotification({
        enquiryId: enquiry.enquiryId,
        name: enquiry.name,
        phone: enquiry.phone,
        email: enquiry.email,
        message: enquiry.message,
        propertyId: property.propertyId,
        propertyCode: property.propertyCode,
        propertyTitle: property.title,
        city: property.city,
        locality: property.locality,
      })
      .catch(() => undefined);

    return { enquiry, lead };
  }

  async adminList() {
    const rows = await this.repo.find({
      relations: { property: true },
      order: { createdAt: 'DESC' },
    });
    return rows.map((e) => this.mapEnquiryRow(e));
  }

  async listForCustomer(customerId: string, phone10?: string | null) {
    const qb = this.repo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.property', 'property')
      .where('e.customerId = :customerId', { customerId });
    if (phone10 && phone10.length === 10) {
      qb.orWhere('e.phone = :phone', { phone: phone10 });
    }
    const rows = await qb.orderBy('e.createdAt', 'DESC').getMany();
    return rows.map((e) => this.mapEnquiryRow(e));
  }

  async adminUpdate(enquiryId: string, dto: UpdateEnquiryDto) {
    const enquiry = await this.repo.findOne({
      where: { enquiryId },
      relations: { property: true },
    });
    if (!enquiry) throw new NotFoundException('Enquiry not found');

    if (dto.status) {
      enquiry.status = dto.status;
    }

    if (dto.responseNote?.trim()) {
      const stamp = new Date().toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const block = `Team (${stamp}): ${dto.responseNote.trim()}`;
      enquiry.adminResponse = enquiry.adminResponse
        ? `${enquiry.adminResponse}\n\n${block}`
        : block;
    }

    const saved = await this.repo.save(enquiry);
    return this.mapEnquiryRow(saved);
  }

  private mapEnquiryRow(e: InfraEnquiry) {
    return {
      enquiryId: e.enquiryId,
      name: e.name,
      phone: e.phone,
      email: e.email,
      message: e.message,
      status: e.status,
      source: e.source,
      crmLeadId: e.crmLeadId,
      adminResponse: e.adminResponse,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      propertyId: e.property?.propertyId ?? null,
      propertySlug: e.property?.slug ?? null,
      propertyTitle: e.property?.title ?? null,
      propertyCode: e.property?.propertyCode ?? null,
      city: e.property?.city ?? null,
      locality: e.property?.locality ?? null,
    };
  }
}
