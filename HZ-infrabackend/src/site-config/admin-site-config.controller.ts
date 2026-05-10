import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { SiteConfigService } from './site-config.service';

class PatchHeroDto {
  @IsOptional()
  @IsString()
  heroImageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(40)
  heroOpacity?: number;
}

@ApiTags('admin-site-config')
@Controller('admin/site-config')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminSiteConfigController {
  constructor(private readonly cfg: SiteConfigService) {}

  @Patch('hero')
  patch(@Body() body: PatchHeroDto) {
    return this.cfg.patchHero(body);
  }
}
