import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { SiteConfigService } from './site-config.service';
import { BROWSE_TYPE_KEYS } from './browse-type.constants';
import type {
  BrowseCityContentDto,
  CuratedContentDto,
  TestimonialsContentDto,
  WhyHouznextContentDto,
} from './homepage-sections.constants';

class HeroMetricDto {
  @IsString()
  value: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsBoolean()
  accent?: boolean;
}

class PatchHeroDto {
  @IsOptional()
  @IsString()
  heroImageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  heroImageUrls?: string[];

  @IsOptional()
  @IsString()
  heroHeadline?: string;

  @IsOptional()
  @IsString()
  heroSubheadline?: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(40)
  heroOpacity?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  heroPopularTags?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HeroMetricDto)
  heroMetrics?: HeroMetricDto[];
}

class BrowseTypeCardPatchDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsString()
  countLabel?: string;

  @IsOptional()
  @IsString()
  href?: string;
}

class PatchBrowseByTypeDto {
  @IsOptional()
  @IsObject()
  images?: Record<string, string | null>;

  @IsOptional()
  @IsString()
  sectionTitle?: string;

  @IsOptional()
  @IsString()
  sectionSubtitle?: string;

  @IsOptional()
  @IsObject()
  cards?: Partial<Record<(typeof BROWSE_TYPE_KEYS)[number], BrowseTypeCardPatchDto>>;
}

class PatchFeaturedProjectsDto {
  @IsOptional()
  @IsString()
  eyebrow?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  viewAllLabel?: string;
}

class CuratedRowPatchDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsIn([3, 5])
  cols?: 3 | 5;
}

class PatchCuratedDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  defaultSubtitle?: string;

  @IsOptional()
  @IsString()
  viewAllLabel?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CuratedRowPatchDto)
  rows?: CuratedRowPatchDto[];
}

class CityCardPatchDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  href?: string;

  @IsOptional()
  @IsString()
  count?: string;

  @IsOptional()
  @IsString()
  areas?: string;

  @IsOptional()
  @IsString()
  gradient?: string;

  @IsOptional()
  @IsString()
  titleSize?: string;

  @IsOptional()
  @IsBoolean()
  showBadge?: boolean;

  @IsOptional()
  @IsBoolean()
  wide?: boolean;

  @IsOptional()
  @IsString()
  badgeLabel?: string;
}

class PatchBrowseCityDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  defaultCity?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cityOptions?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CityCardPatchDto)
  cities?: CityCardPatchDto[];
}

class TestimonialItemPatchDto {
  @IsOptional()
  @IsString()
  initials?: string;

  @IsOptional()
  @IsString()
  avatarBg?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  text?: string;
}

class PatchTestimonialsDto {
  @IsOptional()
  @IsString()
  eyebrow?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestimonialItemPatchDto)
  items?: TestimonialItemPatchDto[];
}

class PatchForSellersDto {
  @IsOptional()
  @IsString()
  eyebrow?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  primaryCta?: string;

  @IsOptional()
  @IsString()
  primaryHref?: string;

  @IsOptional()
  @IsString()
  secondaryCta?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  perks?: string[];
}

class WhyCardPatchDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  badgeLabel?: string;
}

class PatchWhyHouznextDto {
  @IsOptional()
  @IsString()
  eyebrow?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhyCardPatchDto)
  cards?: WhyCardPatchDto[];
}

@ApiTags('admin-site-config')
@Controller('admin/site-config')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminSiteConfigController {
  constructor(private readonly cfg: SiteConfigService) {}

  @Get('hero')
  getHero() {
    return this.cfg.getHero();
  }

  @Patch('hero')
  patch(@Body() body: PatchHeroDto) {
    return this.cfg.patchHero(body);
  }

  @Get('browse-by-type')
  getBrowseByType() {
    return this.cfg.getBrowseByType();
  }

  @Patch('browse-by-type')
  patchBrowseByType(@Body() body: PatchBrowseByTypeDto) {
    return this.cfg.patchBrowseByType(body);
  }

  @Get('featured-projects')
  getFeaturedProjects() {
    return this.cfg.getFeaturedProjects();
  }

  @Patch('featured-projects')
  patchFeaturedProjects(@Body() body: PatchFeaturedProjectsDto) {
    return this.cfg.patchFeaturedProjects(body);
  }

  @Get('curated-properties')
  getCuratedSection() {
    return this.cfg.getCuratedSection();
  }

  @Patch('curated-properties')
  patchCuratedSection(@Body() body: PatchCuratedDto) {
    return this.cfg.patchCuratedSection(body as Partial<CuratedContentDto>);
  }

  @Get('browse-by-city')
  getBrowseByCity() {
    return this.cfg.getBrowseByCity();
  }

  @Patch('browse-by-city')
  patchBrowseByCity(@Body() body: PatchBrowseCityDto) {
    return this.cfg.patchBrowseByCity(body as Partial<BrowseCityContentDto>);
  }

  @Get('testimonials')
  getTestimonials() {
    return this.cfg.getTestimonials();
  }

  @Patch('testimonials')
  patchTestimonials(@Body() body: PatchTestimonialsDto) {
    return this.cfg.patchTestimonials(body as Partial<TestimonialsContentDto>);
  }

  @Get('for-sellers')
  getForSellers() {
    return this.cfg.getForSellers();
  }

  @Patch('for-sellers')
  patchForSellers(@Body() body: PatchForSellersDto) {
    return this.cfg.patchForSellers(body);
  }

  @Get('why-houznext')
  getWhyHouznext() {
    return this.cfg.getWhyHouznext();
  }

  @Patch('why-houznext')
  patchWhyHouznext(@Body() body: PatchWhyHouznextDto) {
    return this.cfg.patchWhyHouznext(body as Partial<WhyHouznextContentDto>);
  }
}
