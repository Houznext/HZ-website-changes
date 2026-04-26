import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SiteCmsService } from './site-cms.service';
import { UpsertCmsDto } from './site-cms.dto';
import { ControllerAuthGuard } from '../guard';

@Controller('site-cms')
export class SiteCmsController {
  constructor(private readonly service: SiteCmsService) {}

  @UseGuards(ControllerAuthGuard)
  @Post('upsert')
  async upsert(@Body() dto: UpsertCmsDto) {
    const entry = await this.service.upsert(dto);
    return { key: entry.key, updatedAt: entry.updatedAt };
  }

  @Get(':key')
  async get(@Param('key') key: string) {
    const data = await this.service.get(key);
    return { key, data };
  }
}
