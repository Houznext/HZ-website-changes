import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfraSiteConfig } from './entities/infra-site-config.entity';

const HERO_KEY = 'hero';

@Injectable()
export class SiteConfigService {
  constructor(
    @InjectRepository(InfraSiteConfig)
    private readonly repo: Repository<InfraSiteConfig>,
  ) {}

  async getHero(): Promise<{ heroImageUrl: string | null; heroOpacity: number }> {
    let row = await this.repo.findOne({ where: { configKey: HERO_KEY } });
    if (!row) {
      row = this.repo.create({
        configKey: HERO_KEY,
        heroImageUrl:
          'https://images.unsplash.com/photo-1600596542815-ffad4b1533a9?w=1920&q=80',
        heroOpacity: 18,
      });
      await this.repo.save(row);
    }
    return { heroImageUrl: row.heroImageUrl, heroOpacity: row.heroOpacity };
  }

  async patchHero(patch: { heroImageUrl?: string; heroOpacity?: number }) {
    let row = await this.repo.findOne({ where: { configKey: HERO_KEY } });
    if (!row) {
      row = this.repo.create({ configKey: HERO_KEY, heroImageUrl: null, heroOpacity: 18 });
    }
    if (patch.heroImageUrl !== undefined) row.heroImageUrl = patch.heroImageUrl;
    if (patch.heroOpacity !== undefined) row.heroOpacity = patch.heroOpacity;
    await this.repo.save(row);
    return this.getHero();
  }
}
