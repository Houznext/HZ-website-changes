import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraPageSeo } from './infra-page-seo.entity';
import { InfraPageSeoService } from './infra-page-seo.service';
import { InfraPageSeoController } from './infra-page-seo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InfraPageSeo])],
  controllers: [InfraPageSeoController],
  providers: [InfraPageSeoService],
  exports: [InfraPageSeoService],
})
export class InfraPageSeoModule {}
