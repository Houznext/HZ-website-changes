import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraSiteConfig } from './entities/infra-site-config.entity';
import { SiteConfigService } from './site-config.service';
import { SiteConfigController } from './site-config.controller';
import { AdminSiteConfigController } from './admin-site-config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InfraSiteConfig])],
  controllers: [SiteConfigController, AdminSiteConfigController],
  providers: [SiteConfigService],
  exports: [SiteConfigService],
})
export class SiteConfigModule {}
