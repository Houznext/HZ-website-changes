import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentTracking } from './entities/payment-tracking.entity';
import { PaymentTrackingController } from './payment-tracking.controller';
import { PaymentTrackingService } from './payment-tracking.service';
import { CustomBuilder } from '../entities/custom-builder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentTracking, CustomBuilder])],
  controllers: [PaymentTrackingController],
  providers: [PaymentTrackingService],
  exports: [PaymentTrackingService],
})
export class PaymentTrackingModule {}
