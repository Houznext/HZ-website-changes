import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { HeroSlide } from './entities/hero-slide.entity';
import { CarouselSettings } from './entities/carousel-settings.entity';
import { HeroCarouselService } from './hero-carousel.service';
import { HeroCarouselController } from './hero-carousel.controller';
import { S3Module } from '../common/s3/s3.module';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HeroSlide, CarouselSettings, User]),
    MulterModule.register({ storage: memoryStorage() }),
    S3Module,
  ],
  controllers: [HeroCarouselController],
  providers: [HeroCarouselService],
  exports: [HeroCarouselService],
})
export class HeroCarouselModule {}
