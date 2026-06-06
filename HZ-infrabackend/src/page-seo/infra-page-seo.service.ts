import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfraPageSeo } from './infra-page-seo.entity';
import { UpsertInfraPageSeoDto } from './infra-page-seo.dto';
import {
  getInfraDefaultRowForPath,
  INFRA_PAGE_SEO_DEFAULT_ROWS,
  type InfraPageSeoDefaultRow,
} from './infra-page-seo-defaults';
import { buildSeoLandingDefaultRows } from './seo-landing.constants';

const ALL_DEFAULT_ROWS: InfraPageSeoDefaultRow[] = [
  ...INFRA_PAGE_SEO_DEFAULT_ROWS,
  ...buildSeoLandingDefaultRows(),
];

export type InfraPageSeoPublicDto = {
  path: string;
  label: string;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string | null;
  hasStructuredData: boolean;
  noIndex: boolean;
  keywords: string | null;
  source: 'database' | 'default';
};

export type InfraPageSeoAdminRow = {
  id: string;
  path: string;
  label: string;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string | null;
  hasStructuredData: boolean;
  noIndex: boolean;
  keywords: string | null;
  updatedAt?: string | null;
  seededOnly?: boolean;
};

@Injectable()
export class InfraPageSeoService implements OnModuleInit {
  constructor(
    @InjectRepository(InfraPageSeo)
    private readonly repo: Repository<InfraPageSeo>,
  ) {}

  async onModuleInit(): Promise<void> {
    for (const row of ALL_DEFAULT_ROWS) {
      const existing = await this.repo.findOne({ where: { path: row.path } });
      if (!existing) {
        await this.repo.save(
          this.repo.create({
            path: row.path,
            label: row.label,
            metaTitle: row.metaTitle,
            metaDescription: row.metaDescription,
            ogImageUrl: row.ogImageUrl,
            hasStructuredData: row.hasStructuredData,
            noIndex: row.noIndex,
            keywords: row.keywords,
          }),
        );
      }
    }
  }

  private syntheticIdForPath(path: string): string {
    if (path === '/') return 'seed:root';
    return `seed:${path.slice(1).replace(/\//g, '-')}`;
  }

  private defToAdminRow(def: InfraPageSeoDefaultRow): InfraPageSeoAdminRow {
    return {
      id: this.syntheticIdForPath(def.path),
      path: def.path,
      label: def.label,
      metaTitle: def.metaTitle,
      metaDescription: def.metaDescription,
      ogImageUrl: def.ogImageUrl,
      hasStructuredData: def.hasStructuredData,
      noIndex: def.noIndex,
      keywords: def.keywords,
      updatedAt: null,
      seededOnly: true,
    };
  }

  private entityToAdminRow(e: InfraPageSeo): InfraPageSeoAdminRow {
    return {
      id: e.id,
      path: e.path,
      label: e.label,
      metaTitle: e.metaTitle,
      metaDescription: e.metaDescription,
      ogImageUrl: e.ogImageUrl,
      hasStructuredData: e.hasStructuredData,
      noIndex: e.noIndex,
      keywords: e.keywords,
      updatedAt:
        e.updatedAt instanceof Date ? e.updatedAt.toISOString() : (e.updatedAt as string | undefined) ?? null,
      seededOnly: false,
    };
  }

  async findAllMergedForAdmin(): Promise<InfraPageSeoAdminRow[]> {
    let dbRows: InfraPageSeo[] = [];
    try {
      dbRows = await this.repo.find({ order: { path: 'ASC' } });
    } catch {
      dbRows = [];
    }
    const byPath = new Map(dbRows.map((r) => [r.path, r]));
    const out: InfraPageSeoAdminRow[] = [];
    for (const def of ALL_DEFAULT_ROWS) {
      const entity = byPath.get(def.path);
      if (entity) {
        out.push(this.entityToAdminRow(entity));
        byPath.delete(def.path);
      } else {
        out.push(this.defToAdminRow(def));
      }
    }
    const extras = Array.from(byPath.values()).sort((a, b) => a.path.localeCompare(b.path));
    for (const e of extras) {
      out.push(this.entityToAdminRow(e));
    }
    return out;
  }

  normalizePath(rawPath: string): string {
    if (!rawPath || rawPath.trim() === '') return '/';
    const noQuery = rawPath.split('?')[0].trim();
    return noQuery.startsWith('/') ? noQuery : `/${noQuery}`;
  }

  async upsert(dto: UpsertInfraPageSeoDto): Promise<InfraPageSeo> {
    const path = this.normalizePath(dto.path);
    let row = await this.repo.findOne({ where: { path } });
    if (!row) {
      row = this.repo.create({
        path,
        label: dto.label.trim(),
        metaTitle: dto.metaTitle.trim(),
        metaDescription: dto.metaDescription.trim(),
        ogImageUrl: dto.ogImageUrl?.trim() || null,
        hasStructuredData: dto.hasStructuredData ?? false,
        noIndex: dto.noIndex ?? false,
        keywords: dto.keywords?.trim() || null,
      });
    } else {
      row.label = dto.label.trim();
      row.metaTitle = dto.metaTitle.trim();
      row.metaDescription = dto.metaDescription.trim();
      row.ogImageUrl = dto.ogImageUrl?.trim() || null;
      if (dto.hasStructuredData !== undefined) row.hasStructuredData = dto.hasStructuredData;
      if (dto.noIndex !== undefined) row.noIndex = dto.noIndex;
      row.keywords = dto.keywords?.trim() || null;
    }
    return this.repo.save(row);
  }

  async resolveForPublic(rawPath: string): Promise<InfraPageSeoPublicDto> {
    const path = this.normalizePath(rawPath);
    const row = await this.repo.findOne({ where: { path } });
    if (row) {
      return {
        path: row.path,
        label: row.label,
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
        ogImageUrl: row.ogImageUrl,
        hasStructuredData: row.hasStructuredData,
        noIndex: row.noIndex,
        keywords: row.keywords,
        source: 'database',
      };
    }
    const def = getInfraDefaultRowForPath(path);
    if (def) {
      return {
        path: def.path,
        label: def.label,
        metaTitle: def.metaTitle,
        metaDescription: def.metaDescription,
        ogImageUrl: def.ogImageUrl,
        hasStructuredData: def.hasStructuredData,
        noIndex: def.noIndex,
        keywords: def.keywords,
        source: 'default',
      };
    }
    return {
      path,
      label: path,
      metaTitle: 'Houznext Infra | Verified Real Estate',
      metaDescription:
        'Buy and sell land, villas, apartments and plots with RERA verification on Houznext Infra.',
      ogImageUrl: null,
      hasStructuredData: false,
      noIndex: false,
      keywords: null,
      source: 'default',
    };
  }
}
