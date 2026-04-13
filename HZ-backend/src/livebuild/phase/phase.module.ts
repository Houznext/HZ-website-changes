import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomBuilder } from '../entities/custom-builder.entity';
import { DailyProgress } from '../daily-progress/entities/daily-progress.entity';
import { PhaseService } from './phase.service';
import { PhaseController } from './phase.controller';
import { Phase } from './entities/phase.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Phase, CustomBuilder, DailyProgress])],
  controllers: [PhaseController],
  providers: [PhaseService],
  exports: [PhaseService],
})
export class PhaseModule {}
