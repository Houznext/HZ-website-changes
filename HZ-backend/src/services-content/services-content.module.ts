import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ServiceContent } from './entities/service-content.entity';
import { ServicesContentService } from './services-content.service';
import { ServicesContentController } from './services-content.controller';
import { S3Module } from '../common/s3/s3.module';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceContent, User]),
    MulterModule.register({ storage: memoryStorage() }),
    S3Module,
  ],
  controllers: [ServicesContentController],
  providers: [ServicesContentService],
  exports: [ServicesContentService],
})
export class ServicesContentModule {}
