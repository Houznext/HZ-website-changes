import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { User } from 'src/user/entities/user.entity';
import { CustomBuilder } from '../entities/custom-builder.entity';
import { LocationDetails } from 'src/property/entities/location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LocationDetails, User, CustomBuilder])],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}
