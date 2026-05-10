import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraProperty } from './entities/infra-property.entity';
import { InfraPropertyMedia } from './entities/infra-property-media.entity';
import { InfraPropertyDetails } from './entities/infra-property-details.entity';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard';

@Module({
  imports: [TypeOrmModule.forFeature([InfraProperty, InfraPropertyMedia, InfraPropertyDetails])],
  controllers: [PropertyController],
  providers: [PropertyService, OptionalJwtGuard],
  exports: [PropertyService],
})
export class PropertyModule {}
