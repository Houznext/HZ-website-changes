import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SiteVisitService } from './site-visit.service';
import { CreateSiteVisitDto } from './dto/site-visit.dto';

@ApiTags('site-visits')
@Controller('site-visits')
export class SiteVisitController {
  constructor(private readonly visits: SiteVisitService) {}

  @Post()
  create(@Body() dto: CreateSiteVisitDto) {
    return this.visits.create(dto);
  }
}
