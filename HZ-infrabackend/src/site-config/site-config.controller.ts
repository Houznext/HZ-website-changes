import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SiteConfigService } from './site-config.service';

@ApiTags('site-config')
@Controller('site-config')
export class SiteConfigController {
  constructor(private readonly cfg: SiteConfigService) {}

  @Get('hero')
  hero() {
    return this.cfg.getHero();
  }

  @Get('browse-by-type')
  browseByType() {
    return this.cfg.getBrowseByType();
  }

  @Get('recent-listings')
  recentListings() {
    return this.cfg.getRecentListings();
  }

  @Get('featured-projects')
  featuredProjects() {
    return this.cfg.getFeaturedProjects();
  }

  @Get('curated-properties')
  curatedProperties() {
    return this.cfg.getCuratedSection();
  }

  @Get('browse-by-city')
  browseByCity() {
    return this.cfg.getBrowseByCity();
  }

  @Get('testimonials')
  testimonials() {
    return this.cfg.getTestimonials();
  }

  @Get('for-sellers')
  forSellers() {
    return this.cfg.getForSellers();
  }

  @Get('why-houznext')
  whyHouznext() {
    return this.cfg.getWhyHouznext();
  }

  @Get('seo-geo')
  seoGeo() {
    return this.cfg.getSeoGeo();
  }
}
