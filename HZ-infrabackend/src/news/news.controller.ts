import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NewsService } from './news.service';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly news: NewsService) {}

  @Get()
  list() {
    return this.news.list();
  }

  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.news.bySlug(slug);
  }
}
