import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CmsService } from './cms.service';
import { ControllerAuthGuard } from '../guard';
import { CmsUpsertBodyDto } from './dto/cms-upsert-body.dto';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // ADMIN — load current row (any status) for editing
  @UseGuards(ControllerAuthGuard)
  @Get('manage/:key')
  async getForManagement(@Param('key') key: string) {
    const record = await this.cmsService.get(key);
    if (!record) return { data: null, status: null };
    return { data: record.data, status: record.status };
  }

  // PUBLIC — website reads published content, no auth needed
  @Get(':key')
  async getPublished(@Param('key') key: string) {
    const record = await this.cmsService.get(key);
    if (!record || record.status !== 'published') return { data: null };
    return { data: record.data };
  }

  // ADMIN — save as draft
  @UseGuards(ControllerAuthGuard)
  @Post(':key/draft')
  async saveDraft(
    @Param('key') key: string,
    @Body() body: CmsUpsertBodyDto,
  ) {
    return this.cmsService.upsert(
      key,
      body.data as Record<string, any>,
      'draft',
    );
  }

  // ADMIN — publish live
  @UseGuards(ControllerAuthGuard)
  @Post(':key/publish')
  async publish(
    @Param('key') key: string,
    @Body() body: CmsUpsertBodyDto,
  ) {
    await this.cmsService.upsert(
      key,
      body.data as Record<string, any>,
      'published',
    );
    return this.cmsService.publish(key);
  }
}
