import { Module } from '@nestjs/common';
import { CostEstimatorService } from './cost-estimator.service';
import { CostEstimatorController } from './cost-estimator.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostEstimator } from './entities/cost-estimator.entity';
import { ItemGroup } from './entities/itemgroup.entity';
import { NotificationService } from 'src/notifications/notification.service';
import { MailerService } from 'src/sendEmail.service';
import { Notification } from 'src/notifications/entities/notification.entity';
import { SmsService } from 'src/sms.service';
import { User } from 'src/user/entities/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { S3Module } from 'src/common/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CostEstimator, ItemGroup, Notification, User, Branch]),
    S3Module,
  ],
  providers: [
    CostEstimatorService,
    NotificationService,
    MailerService,
    SmsService,
  ],
  controllers: [CostEstimatorController],
})
export class CostEstimatorModule {}
