import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ControllerAuthGuard } from 'src/guard';
import { PageSeoService } from './page-seo.service';
import { UpsertPageSeoDto } from './page-seo.dto';

@ApiTags('Page SEO')
@Controller('page-seo')
export class PageSeoController {
  constructor(private readonly service: PageSeoService) {}

  @Get('public/by-path')
  @ApiOperation({ summary: 'Public SEO payload for a path (marketing site)' })
  async publicByPath(@Query('path') path = '/') {
    return this.service.resolveForPublic(path);
  }

  @Get()
  @UseGuards(ControllerAuthGuard)
  @ApiOperation({
    summary: 'List page SEO for admin (defaults ∪ DB, merged by path)',
  })
  async list() {
    return this.service.findAllMergedForAdmin();
  }

  @Put()
  @UseGuards(ControllerAuthGuard)
  @ApiOperation({ summary: 'Create or update SEO for a path (admin)' })
  async upsert(@Body() dto: UpsertPageSeoDto) {
    const saved = await this.service.upsert(dto);
    return {
      id: saved.id,
      path: saved.path,
      label: saved.label,
      metaTitle: saved.metaTitle,
      metaDescription: saved.metaDescription,
      ogImageUrl: saved.ogImageUrl,
      hasStructuredData: saved.hasStructuredData,
      updatedAt: saved.updatedAt,
    };
  }
}
