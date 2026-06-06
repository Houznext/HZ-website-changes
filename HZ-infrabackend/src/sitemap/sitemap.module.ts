import { Module } from '@nestjs/common';
import { PropertyModule } from '../property/property.module';
import { ProjectModule } from '../project/project.module';
import { NewsModule } from '../news/news.module';
import { SitemapController } from './sitemap.controller';

@Module({
  imports: [PropertyModule, ProjectModule, NewsModule],
  controllers: [SitemapController],
})
export class SitemapModule {}
