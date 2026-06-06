import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PropertyService } from '../property/property.service';
import { ProjectService } from '../project/project.service';
import { NewsService } from '../news/news.service';
import { allSeoLandingPaths } from '../page-seo/seo-landing-shared';

@ApiTags('sitemap')
@Controller('sitemap')
export class SitemapController {
  constructor(
    private readonly properties: PropertyService,
    private readonly projects: ProjectService,
    private readonly news: NewsService,
  ) {}

  @Get('entries')
  async entries() {
    const [properties, projects, articles] = await Promise.all([
      this.properties.sitemapSlugs(),
      this.projects.sitemapSlugs(),
      this.news.sitemapSlugs(),
    ]);
    return {
      properties,
      projects,
      news: articles,
      landingPaths: allSeoLandingPaths(),
    };
  }
}
