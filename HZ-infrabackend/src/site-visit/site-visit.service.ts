import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfraSiteVisit } from './entities/infra-site-visit.entity';
import { InfraProperty } from '../property/entities/infra-property.entity';
import { CreateSiteVisitDto, PatchSiteVisitDto } from './dto/site-visit.dto';

@Injectable()
export class SiteVisitService {
  constructor(
    @InjectRepository(InfraSiteVisit)
    private readonly repo: Repository<InfraSiteVisit>,
    @InjectRepository(InfraProperty)
    private readonly propRepo: Repository<InfraProperty>,
  ) {}

  async create(dto: CreateSiteVisitDto): Promise<InfraSiteVisit> {
    let property: InfraProperty | null = null;
    if (dto.propertyId) {
      property = await this.propRepo.findOne({ where: { propertyId: dto.propertyId } });
    }
    const v = this.repo.create({
      name: dto.name,
      phone: dto.phone,
      email: dto.email ?? null,
      preferredDate: dto.preferredDate ?? null,
      preferredSlot: dto.preferredSlot ?? null,
      property,
      status: 'pending',
    });
    return this.repo.save(v);
  }

  adminList() {
    return this.repo.find({
      relations: { property: true },
      order: { createdAt: 'DESC' },
    });
  }

  async patch(id: string, dto: PatchSiteVisitDto): Promise<InfraSiteVisit> {
    const v = await this.repo.findOne({ where: { visitId: id }, relations: { property: true } });
    if (!v) throw new NotFoundException('Site visit not found');
    Object.assign(v, dto);
    return this.repo.save(v);
  }
}
