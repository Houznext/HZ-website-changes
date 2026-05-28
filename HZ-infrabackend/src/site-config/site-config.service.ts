import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfraSiteConfig } from './entities/infra-site-config.entity';
import {
  BROWSE_TYPE_KEYS,
  BrowseTypeImagesDto,
  DEFAULT_BROWSE_TYPE_IMAGES,
} from './browse-type.constants';
import {
  HeroMetricItem,
  normalizeHeroMetrics,
  normalizePopularTags,
} from './hero-widget.constants';

const HERO_KEY = 'hero';
const BROWSE_BY_TYPE_KEY = 'browse_by_type';

const DEFAULT_HERO_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4b1533a9?w=1920&q=80',
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=85',
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80',
];

const DEFAULT_HEADLINE = "India's most trusted\nproperty platform.";
const DEFAULT_SUBHEADLINE = 'Buy · Sell · Land · Villa · Apartment · Plot — verified by Houznext';

export type HeroConfigDto = {
  heroImageUrl: string | null;
  heroImageUrls: string[];
  heroHeadline: string;
  heroSubheadline: string;
  heroOpacity: number;
  heroPopularTags: string[];
  heroMetrics: HeroMetricItem[];
};

@Injectable()
export class SiteConfigService {
  constructor(
    @InjectRepository(InfraSiteConfig)
    private readonly repo: Repository<InfraSiteConfig>,
  ) {}

  private normalizeImageUrls(row: InfraSiteConfig): string[] {
    const fromJson = Array.isArray(row.heroImageUrls)
      ? row.heroImageUrls.filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
      : [];
    if (fromJson.length) return fromJson.slice(0, 4);
    if (row.heroImageUrl?.trim()) return [row.heroImageUrl.trim()];
    return [...DEFAULT_HERO_IMAGES];
  }

  private toHeroDto(row: InfraSiteConfig): HeroConfigDto {
    const heroImageUrls = this.normalizeImageUrls(row);
    return {
      heroImageUrl: heroImageUrls[0] ?? null,
      heroImageUrls,
      heroHeadline: row.heroHeadline?.trim() || DEFAULT_HEADLINE,
      heroSubheadline: row.heroSubheadline?.trim() || DEFAULT_SUBHEADLINE,
      heroOpacity: row.heroOpacity ?? 18,
      heroPopularTags: normalizePopularTags(row.heroPopularTags),
      heroMetrics: normalizeHeroMetrics(row.heroMetrics),
    };
  }

  async getHero(): Promise<HeroConfigDto> {
    let row = await this.repo.findOne({ where: { configKey: HERO_KEY } });
    if (!row) {
      row = this.repo.create({
        configKey: HERO_KEY,
        heroImageUrl: DEFAULT_HERO_IMAGES[0],
        heroImageUrls: DEFAULT_HERO_IMAGES,
        heroHeadline: DEFAULT_HEADLINE,
        heroSubheadline: DEFAULT_SUBHEADLINE,
        heroOpacity: 18,
      });
      await this.repo.save(row);
    }
    return this.toHeroDto(row);
  }

  async patchHero(patch: {
    heroImageUrl?: string | null;
    heroImageUrls?: string[];
    heroHeadline?: string;
    heroSubheadline?: string;
    heroOpacity?: number;
    heroPopularTags?: string[];
    heroMetrics?: HeroMetricItem[];
  }) {
    let row = await this.repo.findOne({ where: { configKey: HERO_KEY } });
    if (!row) {
      row = this.repo.create({ configKey: HERO_KEY, heroOpacity: 18 });
    }
    if (patch.heroImageUrls !== undefined) {
      const urls = patch.heroImageUrls
        .filter((u) => typeof u === 'string' && u.trim().length > 0)
        .map((u) => u.trim())
        .slice(0, 4);
      row.heroImageUrls = urls.length ? urls : null;
      row.heroImageUrl = urls[0] ?? null;
    } else if (patch.heroImageUrl !== undefined) {
      row.heroImageUrl = patch.heroImageUrl;
      if (patch.heroImageUrl) {
        row.heroImageUrls = [patch.heroImageUrl];
      }
    }
    if (patch.heroHeadline !== undefined) row.heroHeadline = patch.heroHeadline;
    if (patch.heroSubheadline !== undefined) row.heroSubheadline = patch.heroSubheadline;
    if (patch.heroOpacity !== undefined) row.heroOpacity = patch.heroOpacity;
    if (patch.heroPopularTags !== undefined) {
      row.heroPopularTags = normalizePopularTags(patch.heroPopularTags);
    }
    if (patch.heroMetrics !== undefined) {
      row.heroMetrics = normalizeHeroMetrics(patch.heroMetrics);
    }
    await this.repo.save(row);
    return this.getHero();
  }

  private normalizeBrowseImages(raw: Record<string, string> | null | undefined): BrowseTypeImagesDto {
    const out = { ...DEFAULT_BROWSE_TYPE_IMAGES };
    for (const key of BROWSE_TYPE_KEYS) {
      const v = raw?.[key];
      if (typeof v === 'string' && v.trim()) out[key] = v.trim();
    }
    return out;
  }

  async getBrowseByType(): Promise<BrowseTypeImagesDto> {
    let row = await this.repo.findOne({ where: { configKey: BROWSE_BY_TYPE_KEY } });
    if (!row) {
      row = this.repo.create({
        configKey: BROWSE_BY_TYPE_KEY,
        browseTypeImages: { ...DEFAULT_BROWSE_TYPE_IMAGES } as Record<string, string>,
      });
      await this.repo.save(row);
    }
    return this.normalizeBrowseImages(row.browseTypeImages);
  }

  async patchBrowseByType(patch: Partial<BrowseTypeImagesDto>): Promise<BrowseTypeImagesDto> {
    let row = await this.repo.findOne({ where: { configKey: BROWSE_BY_TYPE_KEY } });
    if (!row) {
      row = this.repo.create({
        configKey: BROWSE_BY_TYPE_KEY,
        browseTypeImages: { ...DEFAULT_BROWSE_TYPE_IMAGES } as Record<string, string>,
      });
    }
    const current = this.normalizeBrowseImages(row.browseTypeImages);
    const next: BrowseTypeImagesDto = { ...current };
    for (const key of BROWSE_TYPE_KEYS) {
      if (patch[key] !== undefined) {
        const v = patch[key];
        next[key] = v && v.trim() ? v.trim() : null;
      }
    }
    row.browseTypeImages = Object.fromEntries(
      BROWSE_TYPE_KEYS.map((k) => [k, next[k]]).filter((entry): entry is [string, string] => !!entry[1]),
    ) as Record<string, string>;
    await this.repo.save(row);
    return this.getBrowseByType();
  }
}
