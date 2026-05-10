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
}
