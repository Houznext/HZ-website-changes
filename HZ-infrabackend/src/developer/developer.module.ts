import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraProperty } from '../property/entities/infra-property.entity';
import { InfraEnquiry } from '../enquiry/entities/infra-enquiry.entity';
import { PropertyModule } from '../property/property.module';
import { DeveloperService } from './developer.service';
import { DeveloperController } from './developer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InfraProperty, InfraEnquiry]), PropertyModule],
  controllers: [DeveloperController],
  providers: [DeveloperService],
})
export class DeveloperModule {}
