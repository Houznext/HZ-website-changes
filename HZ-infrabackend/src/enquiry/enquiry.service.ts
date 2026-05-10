import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InfraEnquiry } from './entities/infra-enquiry.entity';
import { InfraCRMLead } from '../crm/entities/infra-crm-lead.entity';
import { InfraProperty } from '../property/entities/infra-property.entity';
import { CreateEnquiryDto } from './dto/enquiry.dto';

@Injectable()
export class EnquiryService {
  constructor(
    @InjectRepository(InfraEnquiry)
    private readonly repo: Repository<InfraEnquiry>,
    @InjectRepository(InfraProperty)
    private readonly propRepo: Repository<InfraProperty>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateEnquiryDto): Promise<{ enquiry: InfraEnquiry; lead: InfraCRMLead }> {
    const property = await this.propRepo.findOne({ where: { propertyId: dto.propertyId } });
    if (!property) throw new NotFoundException('Property not found');

    return this.dataSource.transaction(async (em) => {
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
  }

  async adminList(): Promise<InfraEnquiry[]> {
    return this.repo.find({
      relations: { property: true },
      order: { createdAt: 'DESC' },
    });
  }
}
