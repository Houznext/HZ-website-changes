import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraNews } from './entities/infra-news.entity';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { AdminNewsController } from './admin-news.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InfraNews])],
  controllers: [NewsController, AdminNewsController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
