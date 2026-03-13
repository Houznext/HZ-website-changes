import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScopeTemplate } from './entities/scope-template.entity';
import { QcCheckpointTemplate } from './entities/qc-checkpoint-template.entity';
import { ScopeOfWork } from './entities/scope-of-work.entity';
import { DailyUpdate } from './entities/daily-update.entity';
import { LabourEntry } from './entities/labour-entry.entity';
import { MaterialUsage } from './entities/material-usage.entity';
import { QcItem } from './entities/qc-item.entity';
import { SnagItem } from './entities/snag-item.entity';
import { ScopeMedia } from './entities/scope-media.entity';
import { Dpr } from './entities/dpr.entity';
import { BuildliveService } from './buildlive.service';
import { BuildliveSeedService } from './buildlive-seed.service';
import { BuildliveController } from './buildlive.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScopeTemplate,
      QcCheckpointTemplate,
      ScopeOfWork,
      DailyUpdate,
      LabourEntry,
      MaterialUsage,
      QcItem,
      SnagItem,
      ScopeMedia,
      Dpr,
    ]),
  ],
  providers: [BuildliveService, BuildliveSeedService],
  controllers: [BuildliveController],
})
export class BuildliveModule {}

