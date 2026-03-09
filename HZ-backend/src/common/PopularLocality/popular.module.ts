import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PopularLocalityService } from './popular-locality.service';
import { PopularLocalityController } from './popular-locality.controller';
import { PopularLocality } from './entity/popular-locality';

@Module({
  imports: [TypeOrmModule.forFeature([PopularLocality])],
  providers: [PopularLocalityService],
  controllers: [PopularLocalityController],
  exports: [PopularLocalityService],
})
export class PopularLocalityModule {}
