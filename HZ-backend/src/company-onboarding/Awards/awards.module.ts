import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Award } from './entity/company-awards.entity';
import { AwardController } from './awards.controller';
import { AwardService } from './awards.service';
import { Company } from '../entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Award, Company])],
  controllers: [AwardController],
  providers: [AwardService],
  exports: [AwardService],
})
export class AwardModule {}
