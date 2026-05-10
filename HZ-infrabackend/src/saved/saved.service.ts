import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfraSavedProperty } from './entities/infra-saved.entity';
import { InfraProperty } from '../property/entities/infra-property.entity';

@Injectable()
export class SavedService {
  constructor(
    @InjectRepository(InfraSavedProperty)
    private readonly repo: Repository<InfraSavedProperty>,
    @InjectRepository(InfraProperty)
    private readonly propRepo: Repository<InfraProperty>,
  ) {}

  async save(customerId: string, propertyId: string): Promise<InfraSavedProperty> {
    const property = await this.propRepo.findOne({ where: { propertyId } });
    if (!property) throw new NotFoundException('Property not found');
    const existing = await this.repo.findOne({ where: { customerId, property: { propertyId } } });
    if (existing) throw new ConflictException('Already saved');
    const row = this.repo.create({ customerId, property });
    return this.repo.save(row);
  }

  async unsave(customerId: string, propertyId: string): Promise<void> {
    const r = await this.repo
      .createQueryBuilder()
      .delete()
      .where('customerId = :cid', { cid: customerId })
      .andWhere('"propertyId" = :pid', { pid: propertyId })
      .execute();
    if (!r.affected) throw new NotFoundException('Saved item not found');
  }

  async mine(customerId: string): Promise<InfraProperty[]> {
    const rows = await this.repo.find({
      where: { customerId },
      relations: { property: { media: true } },
      order: { createdAt: 'DESC' },
    });
    return rows.map((r) => r.property);
  }
}
