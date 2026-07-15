import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InvoiceEstimator } from './entities/invoice-estimator.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { InvoicePayment } from './entities/invoice-payment.entity';
import { InvoiceAuditLog } from './entities/invoice-audit-log.entity';
import { InvoiceEstimatorService } from './invoice-estimator.service';
import { InvoicesService } from './invoices.service';
import { InvoicePdfService } from './invoice-pdf.service';
import { InvoiceEstimatorController } from './invoice-estimator.controller';
import { InvoicesController } from './invoices.controller';

import { User } from 'src/user/entities/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { CostEstimator } from 'src/cost-estimator/entities/cost-estimator.entity';

import { NotificationModule } from 'src/notifications/notification.module';
import { S3Module } from 'src/common/s3/s3.module';
import { ControllerAuthGuard } from 'src/guard';
import { MailerService } from 'src/sendEmail.service';
import { WhatsAppMsgService } from 'src/whatsApp.service';
import { CustomerNotificationModule } from 'src/customer-notifications/customer-notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvoiceEstimator,
      InvoiceItem,
      InvoicePayment,
      InvoiceAuditLog,
      User,
      Branch,
      CostEstimator,
    ]),
    NotificationModule,
    S3Module,
    CustomerNotificationModule,
  ],

  controllers: [InvoiceEstimatorController, InvoicesController],

  providers: [
    InvoiceEstimatorService,
    InvoicesService,
    InvoicePdfService,
    ControllerAuthGuard,
    MailerService,
    WhatsAppMsgService,
  ],

  exports: [InvoiceEstimatorService, InvoicesService],
})
export class InvoiceEstimatorModule {}
