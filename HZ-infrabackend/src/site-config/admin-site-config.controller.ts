import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsObject, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

class HeroMetricDto {
  @IsString()
  value: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsBoolean()
  accent?: boolean;
}
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { SiteConfigService } from './site-config.service';

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

class PatchBrowseByTypeDto {
  @IsOptional()
  @IsObject()
  images?: Record<string, string | null>;
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
    return this.cfg.patchBrowseByType((body.images ?? {}) as Partial<Record<string, string | null>>);
  }
}
