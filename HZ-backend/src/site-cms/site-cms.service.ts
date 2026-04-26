import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteCmsEntry } from './site-cms.entity';
import { UpsertCmsDto } from './site-cms.dto';

@Injectable()
export class SiteCmsService {
  constructor(
    @InjectRepository(SiteCmsEntry)
    private readonly repo: Repository<SiteCmsEntry>,
  ) {}

  async get(key: string): Promise<object> {
    try {
      const entry = await this.repo.findOne({ where: { key } });
      if (!entry) return {};
      return JSON.parse(entry.data);
    } catch {
      return {};
    }
  }

  async upsert(dto: UpsertCmsDto): Promise<SiteCmsEntry> {
    let entry = await this.repo.findOne({ where: { key: dto.key } });
    if (!entry) entry = this.repo.create({ key: dto.key, data: dto.data });
    else entry.data = dto.data;
    return this.repo.save(entry);
  }
}
