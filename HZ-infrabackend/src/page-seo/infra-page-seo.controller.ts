import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { InfraPageSeoService } from './infra-page-seo.service';
import { UpsertInfraPageSeoDto } from './infra-page-seo.dto';

@ApiTags('page-seo')
@Controller('page-seo')
export class InfraPageSeoController {
  constructor(private readonly service: InfraPageSeoService) {}

  @Get('public/by-path')
  @ApiOperation({ summary: 'Public SEO payload for a path (infra website)' })
  async publicByPath(@Query('path') path = '/') {
    return this.service.resolveForPublic(path);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List page SEO for admin (defaults ∪ DB)' })
  async list() {
    return this.service.findAllMergedForAdmin();
  }

  @Put()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update SEO for a path (admin)' })
  async upsert(@Body() dto: UpsertInfraPageSeoDto) {
    const saved = await this.service.upsert(dto);
    return {
      id: saved.id,
      path: saved.path,
      label: saved.label,
      metaTitle: saved.metaTitle,
      metaDescription: saved.metaDescription,
      ogImageUrl: saved.ogImageUrl,
      hasStructuredData: saved.hasStructuredData,
      noIndex: saved.noIndex,
      keywords: saved.keywords,
      updatedAt: saved.updatedAt,
    };
  }
}
