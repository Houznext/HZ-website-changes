import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfraSiteConfig } from './entities/infra-site-config.entity';
import {
  BROWSE_TYPE_KEYS,
  BrowseTypeImagesDto,
  BrowseTypeKey,
  DEFAULT_BROWSE_TYPE_IMAGES,
} from './browse-type.constants';
import {
  BrowseByTypeContentDto,
  BrowseCityContentDto,
  CuratedContentDto,
  DEFAULT_BROWSE_BY_TYPE_CONTENT,
  DEFAULT_BROWSE_CITY,
  DEFAULT_CURATED,
  DEFAULT_FEATURED_PROJECTS,
  DEFAULT_FOR_SELLERS,
  DEFAULT_RECENT_LISTINGS,
  DEFAULT_TESTIMONIALS,
  DEFAULT_WHY_HOUZNEXT,
  FeaturedProjectsContentDto,
  ForSellersContentDto,
  RecentListingsContentDto,
  mergeBrowseTypeContent,
  mergePayload,
  SECTION_KEYS,
  TestimonialsContentDto,
  WhyHouznextContentDto,
} from './homepage-sections.constants';
import {
  DEFAULT_SEO_GEO,
  InfraSeoGeoDto,
  mergeSeoGeo,
  SEO_GEO_CONFIG_KEY,
} from './seo-geo.constants';
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

export type BrowseByTypeSectionDto = BrowseByTypeContentDto & {
  images: BrowseTypeImagesDto;
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

  async getBrowseByType(): Promise<BrowseByTypeSectionDto> {
    let row = await this.repo.findOne({ where: { configKey: BROWSE_BY_TYPE_KEY } });
    if (!row) {
      row = this.repo.create({
        configKey: BROWSE_BY_TYPE_KEY,
        browseTypeImages: { ...DEFAULT_BROWSE_TYPE_IMAGES } as Record<string, string>,
        sectionPayload: DEFAULT_BROWSE_BY_TYPE_CONTENT as unknown as Record<string, unknown>,
      });
      await this.repo.save(row);
    }
    const content = mergeBrowseTypeContent(row.sectionPayload as Partial<BrowseByTypeContentDto>);
    return {
      ...content,
      images: this.normalizeBrowseImages(row.browseTypeImages),
    };
  }

  async patchBrowseByType(patch: {
    images?: Partial<BrowseTypeImagesDto>;
    sectionTitle?: string;
    sectionSubtitle?: string;
    cards?: Partial<Record<BrowseTypeKey, Partial<BrowseByTypeContentDto['cards'][BrowseTypeKey]>>>;
  }): Promise<BrowseByTypeSectionDto> {
    let row = await this.repo.findOne({ where: { configKey: BROWSE_BY_TYPE_KEY } });
    if (!row) {
      row = this.repo.create({
        configKey: BROWSE_BY_TYPE_KEY,
        browseTypeImages: { ...DEFAULT_BROWSE_TYPE_IMAGES } as Record<string, string>,
        sectionPayload: DEFAULT_BROWSE_BY_TYPE_CONTENT as unknown as Record<string, unknown>,
      });
    }
    if (patch.images) {
      const current = this.normalizeBrowseImages(row.browseTypeImages);
      const next: BrowseTypeImagesDto = { ...current };
      for (const key of BROWSE_TYPE_KEYS) {
        if (patch.images[key] !== undefined) {
          const v = patch.images[key];
          next[key] = v && v.trim() ? v.trim() : null;
        }
      }
      row.browseTypeImages = Object.fromEntries(
        BROWSE_TYPE_KEYS.map((k) => [k, next[k]]).filter((entry): entry is [string, string] => !!entry[1]),
      ) as Record<string, string>;
    }
    const content = mergeBrowseTypeContent(row.sectionPayload as Partial<BrowseByTypeContentDto>);
    if (patch.sectionTitle !== undefined) content.sectionTitle = patch.sectionTitle;
    if (patch.sectionSubtitle !== undefined) content.sectionSubtitle = patch.sectionSubtitle;
    if (patch.cards) {
      for (const key of BROWSE_TYPE_KEYS) {
        if (patch.cards[key]) content.cards[key] = { ...content.cards[key], ...patch.cards[key]! };
      }
    }
    row.sectionPayload = content as unknown as Record<string, unknown>;
    await this.repo.save(row);
    return this.getBrowseByType();
  }

  private async getSection<T extends object>(key: string, defaults: T): Promise<T> {
    let row = await this.repo.findOne({ where: { configKey: key } });
    if (!row) {
      row = this.repo.create({ configKey: key, sectionPayload: defaults as unknown as Record<string, unknown> });
      await this.repo.save(row);
    }
    return mergePayload(defaults, row.sectionPayload as Partial<T>);
  }

  private async patchSection<T extends object>(key: string, defaults: T, patch: Partial<T>): Promise<T> {
    let row = await this.repo.findOne({ where: { configKey: key } });
    if (!row) {
      row = this.repo.create({ configKey: key, sectionPayload: defaults as unknown as Record<string, unknown> });
    }
    const merged = mergePayload(defaults, { ...(row.sectionPayload as Partial<T>), ...patch });
    row.sectionPayload = merged as unknown as Record<string, unknown>;
    await this.repo.save(row);
    return merged;
  }

  getRecentListings() {
    return this.getSection(SECTION_KEYS.RECENT_LISTINGS, DEFAULT_RECENT_LISTINGS);
  }

  patchRecentListings(patch: Partial<RecentListingsContentDto>) {
    return this.patchSection(SECTION_KEYS.RECENT_LISTINGS, DEFAULT_RECENT_LISTINGS, patch);
  }

  getFeaturedProjects() {
    return this.getSection(SECTION_KEYS.FEATURED_PROJECTS, DEFAULT_FEATURED_PROJECTS);
  }

  patchFeaturedProjects(patch: Partial<FeaturedProjectsContentDto>) {
    return this.patchSection(SECTION_KEYS.FEATURED_PROJECTS, DEFAULT_FEATURED_PROJECTS, patch);
  }

  getCuratedSection() {
    return this.getSection(SECTION_KEYS.CURATED, DEFAULT_CURATED);
  }

  patchCuratedSection(patch: Partial<CuratedContentDto>) {
    return this.patchSection(SECTION_KEYS.CURATED, DEFAULT_CURATED, patch);
  }

  getBrowseByCity() {
    return this.getSection(SECTION_KEYS.BROWSE_CITY, DEFAULT_BROWSE_CITY);
  }

  patchBrowseByCity(patch: Partial<BrowseCityContentDto>) {
    return this.patchSection(SECTION_KEYS.BROWSE_CITY, DEFAULT_BROWSE_CITY, patch);
  }

  getTestimonials() {
    return this.getSection(SECTION_KEYS.TESTIMONIALS, DEFAULT_TESTIMONIALS);
  }

  patchTestimonials(patch: Partial<TestimonialsContentDto>) {
    return this.patchSection(SECTION_KEYS.TESTIMONIALS, DEFAULT_TESTIMONIALS, patch);
  }

  getForSellers() {
    return this.getSection(SECTION_KEYS.FOR_SELLERS, DEFAULT_FOR_SELLERS);
  }

  patchForSellers(patch: Partial<ForSellersContentDto>) {
    return this.patchSection(SECTION_KEYS.FOR_SELLERS, DEFAULT_FOR_SELLERS, patch);
  }

  getWhyHouznext() {
    return this.getSection(SECTION_KEYS.WHY_HOUZNEXT, DEFAULT_WHY_HOUZNEXT);
  }

  patchWhyHouznext(patch: Partial<WhyHouznextContentDto>) {
    return this.patchSection(SECTION_KEYS.WHY_HOUZNEXT, DEFAULT_WHY_HOUZNEXT, patch);
  }

  async getSeoGeo(): Promise<InfraSeoGeoDto> {
    let row = await this.repo.findOne({ where: { configKey: SEO_GEO_CONFIG_KEY } });
    if (!row) {
      row = this.repo.create({
        configKey: SEO_GEO_CONFIG_KEY,
        sectionPayload: DEFAULT_SEO_GEO as unknown as Record<string, unknown>,
      });
      await this.repo.save(row);
    }
    return mergeSeoGeo(row.sectionPayload as Partial<InfraSeoGeoDto>);
  }

  async patchSeoGeo(patch: Partial<InfraSeoGeoDto>): Promise<InfraSeoGeoDto> {
    let row = await this.repo.findOne({ where: { configKey: SEO_GEO_CONFIG_KEY } });
    if (!row) {
      row = this.repo.create({
        configKey: SEO_GEO_CONFIG_KEY,
        sectionPayload: DEFAULT_SEO_GEO as unknown as Record<string, unknown>,
      });
    }
    const merged = mergeSeoGeo({ ...(row.sectionPayload as Partial<InfraSeoGeoDto>), ...patch });
    row.sectionPayload = merged as unknown as Record<string, unknown>;
    await this.repo.save(row);
    return merged;
  }
}
