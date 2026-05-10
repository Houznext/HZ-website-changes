import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraSiteVisit } from './entities/infra-site-visit.entity';
import { InfraProperty } from '../property/entities/infra-property.entity';
import { SiteVisitService } from './site-visit.service';
import { SiteVisitController } from './site-visit.controller';
import { AdminSiteVisitController } from './admin-site-visit.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InfraSiteVisit, InfraProperty])],
  controllers: [SiteVisitController, AdminSiteVisitController],
  providers: [SiteVisitService],
})
export class SiteVisitModule {}
