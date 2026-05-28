import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InvoiceEstimator } from './entities/invoice-estimator.entity';
import { InvoiceEstimatorService } from './invoice-estimator.service';
import { InvoiceEstimatorController } from './invoice-estimator.controller';

import { User } from 'src/user/entities/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';

import { NotificationModule } from 'src/notifications/notification.module';
import { ControllerAuthGuard } from 'src/guard';
import { MailerService } from 'src/sendEmail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvoiceEstimator,
      User,
      Branch,
    ]),
    NotificationModule,
  ],

  controllers: [InvoiceEstimatorController],

  providers: [
    InvoiceEstimatorService,
    ControllerAuthGuard,
    MailerService,
  ],

  exports: [InvoiceEstimatorService],
})
export class InvoiceEstimatorModule {}
