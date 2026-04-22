import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CmsContent } from './cms.entity';

@Injectable()
export class CmsService {
  constructor(
    @InjectRepository(CmsContent)
    private readonly repo: Repository<CmsContent>,
  ) {}

  async get(key: string): Promise<CmsContent | null> {
    return this.repo.findOne({ where: { key } });
  }

  async upsert(
    key: string,
    data: Record<string, any>,
    status: 'draft' | 'published',
  ): Promise<CmsContent> {
    const existing = await this.repo.findOne({ where: { key } });
    if (existing) {
      existing.data = data;
      existing.status = status;
      return this.repo.save(existing);
    }
    const record = this.repo.create({ key, data, status });
    return this.repo.save(record);
  }

  async publish(key: string): Promise<CmsContent | null> {
    const existing = await this.repo.findOne({ where: { key } });
    if (!existing) return null;
    existing.status = 'published';
    return this.repo.save(existing);
  }
}
