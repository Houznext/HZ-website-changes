import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Customer } from './entities/customer.entity';
import { Rep } from './entities/rep.entity';
import { InteriorProject } from './entities/interior-project.entity';
import { TradeTemplate } from './entities/trade-template.entity';
import { QcCheckpointTemplate } from './entities/qc-checkpoint-template.entity';
import { ProjectTrade } from './entities/project-trade.entity';
import { DailyUpdate } from './entities/daily-update.entity';
import { LabourEntry } from './entities/labour-entry.entity';
import { MaterialUsage } from './entities/material-usage.entity';
import { QcItem } from './entities/qc-item.entity';
import { SnagItem } from './entities/snag-item.entity';
import { TradeMedia } from './entities/trade-media.entity';
import { DesignUpload } from './entities/design-upload.entity';
import { ProjectDocument } from './entities/project-document.entity';
import { DailyProgressReport } from './entities/daily-progress-report.entity';
import { ReferralLead } from './entities/referral-lead.entity';
import { PaymentMilestone } from './entities/payment-milestone.entity';
import { User } from '../user/entities/user.entity';
import { CustomerIdentityModule } from '../common/customer-identity/customer-identity.module';
import { InteriorService } from './interior.service';
import { InteriorController } from './interior.controller';
import { InteriorSeedService } from './interior-seed.service';

@Module({
  imports: [
    CustomerIdentityModule,
    TypeOrmModule.forFeature([
      Customer,
      Rep,
      InteriorProject,
      TradeTemplate,
      QcCheckpointTemplate,
      ProjectTrade,
      DailyUpdate,
      LabourEntry,
      MaterialUsage,
      QcItem,
      SnagItem,
      TradeMedia,
      DesignUpload,
      ProjectDocument,
      DailyProgressReport,
      ReferralLead,
      PaymentMilestone,
      User,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'hz_jwt_secret_fallback',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  providers: [InteriorService, InteriorSeedService],
  controllers: [InteriorController],
  exports: [InteriorService],
})
export class InteriorModule {}
