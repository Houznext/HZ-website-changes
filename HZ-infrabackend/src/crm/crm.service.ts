import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfraCRMLead } from './entities/infra-crm-lead.entity';
import { PatchLeadDto } from './dto/crm.dto';

@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(InfraCRMLead)
    private readonly repo: Repository<InfraCRMLead>,
  ) {}

  async list(filters: { stage?: string; assignedTo?: string }) {
    const qb = this.repo
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.property', 'p')
      .orderBy('l.createdAt', 'DESC');
    if (filters.stage) qb.andWhere('l.stage = :stage', { stage: filters.stage });
    if (filters.assignedTo) qb.andWhere('l.assignedTo = :a', { a: filters.assignedTo });
    return qb.getMany();
  }

  async stats() {
    const rows = await this.repo
      .createQueryBuilder('l')
      .select('l.stage', 'stage')
      .addSelect('COUNT(*)', 'count')
      .groupBy('l.stage')
      .getRawMany<{ stage: string; count: string }>();
    return Object.fromEntries(rows.map((r) => [r.stage, Number(r.count)]));
  }

  async patch(id: string, dto: PatchLeadDto): Promise<InfraCRMLead> {
    const lead = await this.repo.findOne({ where: { leadId: id }, relations: { property: true } });
    if (!lead) throw new NotFoundException('Lead not found');
    Object.assign(lead, dto);
    if (dto.lastContactNote !== undefined || dto.stage !== undefined) {
      lead.lastContactedAt = new Date();
    }
    return this.repo.save(lead);
  }
}
