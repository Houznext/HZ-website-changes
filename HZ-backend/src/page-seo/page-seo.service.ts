import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SitePageSeo } from './page-seo.entity';
import { UpsertPageSeoDto } from './page-seo.dto';
import {
  PAGE_SEO_DEFAULT_ROWS,
  getDefaultRowForPath,
  type PageSeoDefaultRow,
} from './page-seo-defaults';

export type PageSeoPublicDto = {
  path: string;
  label: string;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string | null;
  hasStructuredData: boolean;
  source: 'database' | 'default';
};

/** Admin list row: persisted UUID `id`, or synthetic `seed:…` when only defaults exist. */
export type PageSeoAdminRow = {
  id: string;
  path: string;
  label: string;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string | null;
  hasStructuredData: boolean;
  updatedAt?: string | null;
  seededOnly?: boolean;
};

@Injectable()
export class PageSeoService implements OnModuleInit {
  constructor(
    @InjectRepository(SitePageSeo)
    private readonly repo: Repository<SitePageSeo>,
  ) {}

  async onModuleInit(): Promise<void> {
    for (const row of PAGE_SEO_DEFAULT_ROWS) {
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
          }),
        );
      } else if (
        (!existing.ogImageUrl || existing.ogImageUrl.trim() === '') &&
        row.ogImageUrl
      ) {
        existing.ogImageUrl = row.ogImageUrl;
        await this.repo.save(existing);
      }
    }
  }

  private syntheticIdForPath(path: string): string {
    if (path === '/') return 'seed:root';
    return `seed:${path.slice(1).replace(/\//g, '-')}`;
  }

  private defToAdminRow(def: PageSeoDefaultRow): PageSeoAdminRow {
    return {
      id: this.syntheticIdForPath(def.path),
      path: def.path,
      label: def.label,
      metaTitle: def.metaTitle,
      metaDescription: def.metaDescription,
      ogImageUrl: def.ogImageUrl,
      hasStructuredData: def.hasStructuredData,
      updatedAt: null,
      seededOnly: true,
    };
  }

  private entityToAdminRow(e: SitePageSeo): PageSeoAdminRow {
    return {
      id: e.id,
      path: e.path,
      label: e.label,
      metaTitle: e.metaTitle,
      metaDescription: e.metaDescription,
      ogImageUrl: e.ogImageUrl,
      hasStructuredData: e.hasStructuredData,
      updatedAt:
        e.updatedAt instanceof Date
          ? e.updatedAt.toISOString()
          : (e.updatedAt as string | undefined) ?? null,
      seededOnly: false,
    };
  }

  /**
   * Admin dropdown + coverage: always includes every path in PAGE_SEO_DEFAULT_ROWS,
   * merged with DB (DB wins). Extra DB-only paths (e.g. custom) are appended.
   */
  async findAllMergedForAdmin(): Promise<PageSeoAdminRow[]> {
    let dbRows: SitePageSeo[] = [];
    try {
      dbRows = await this.repo.find({ order: { path: 'ASC' } });
    } catch {
      dbRows = [];
    }
    const byPath = new Map(dbRows.map((r) => [r.path, r]));
    const out: PageSeoAdminRow[] = [];
    for (const def of PAGE_SEO_DEFAULT_ROWS) {
      const entity = byPath.get(def.path);
      if (entity) {
        out.push(this.entityToAdminRow(entity));
        byPath.delete(def.path);
      } else {
        out.push(this.defToAdminRow(def));
      }
    }
    const extras = Array.from(byPath.values()).sort((a, b) =>
      a.path.localeCompare(b.path),
    );
    for (const e of extras) {
      out.push(this.entityToAdminRow(e));
    }
    return out;
  }

  async findAll(): Promise<SitePageSeo[]> {
    return this.repo.find({
      order: { path: 'ASC' },
    });
  }

  async upsert(dto: UpsertPageSeoDto): Promise<SitePageSeo> {
    const path = dto.path.trim() === '' ? '/' : dto.path.trim();
    let row = await this.repo.findOne({ where: { path } });
    if (!row) {
      row = this.repo.create({
        path,
        label: dto.label.trim(),
        metaTitle: dto.metaTitle.trim(),
        metaDescription: dto.metaDescription.trim(),
        ogImageUrl: dto.ogImageUrl?.trim() || null,
        hasStructuredData: dto.hasStructuredData ?? false,
      });
    } else {
      row.label = dto.label.trim();
      row.metaTitle = dto.metaTitle.trim();
      row.metaDescription = dto.metaDescription.trim();
      row.ogImageUrl = dto.ogImageUrl?.trim() || null;
      if (dto.hasStructuredData !== undefined) {
        row.hasStructuredData = dto.hasStructuredData;
      }
    }
    return this.repo.save(row);
  }

  normalizePath(rawPath: string): string {
    if (!rawPath || rawPath.trim() === '') return '/';
    const noQuery = rawPath.split('?')[0].trim();
    return noQuery.startsWith('/') ? noQuery : `/${noQuery}`;
  }

  async resolveForPublic(rawPath: string): Promise<PageSeoPublicDto> {
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
        source: 'database',
      };
    }
    const def = getDefaultRowForPath(path);
    if (def) {
      return {
        path: def.path,
        label: def.label,
        metaTitle: def.metaTitle,
        metaDescription: def.metaDescription,
        ogImageUrl: def.ogImageUrl,
        hasStructuredData: def.hasStructuredData,
        source: 'default',
      };
    }
    return {
      path,
      label: path,
      metaTitle: 'Houznext',
      metaDescription: 'Interior design and home services by Houznext.',
      ogImageUrl: null,
      hasStructuredData: false,
      source: 'default',
    };
  }
}
