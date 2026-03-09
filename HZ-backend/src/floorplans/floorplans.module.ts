import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FloorplansService } from './floorplans.service';
import { FloorplansController } from './floorplans.controller';
import { Floorplan } from './entities/floorplan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Floorplan])],
  controllers: [FloorplansController],
  providers: [FloorplansService],
  exports: [FloorplansService],
})
export class FloorplansModule {}
