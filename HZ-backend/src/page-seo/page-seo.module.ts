import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SitePageSeo } from './page-seo.entity';
import { PageSeoService } from './page-seo.service';
import { PageSeoController } from './page-seo.controller';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SitePageSeo, User]),
  ],
  controllers: [PageSeoController],
  providers: [PageSeoService],
  exports: [PageSeoService],
})
export class PageSeoModule {}
