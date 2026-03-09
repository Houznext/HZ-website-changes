import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentProvider, PaymentStatus } from '../enums/payment.enum';

// ---------- CREATE PAYMENT SESSION DTO ----------

export class CreatePaymentSessionDto {
  @ApiProperty({ description: 'Order UUID (from cart checkout or direct order)' })
  @IsString()
  orderId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(PaymentProvider)
  provider?: PaymentProvider;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  walletAmount?: string;
}

export class PaymentVerificationDto {
  @ApiProperty()
  @IsString()
  razorpay_order_id: string;

  @ApiProperty()
  @IsString()
  razorpay_payment_id: string;

  @ApiProperty()
  @IsString()
  razorpay_signature: string;
}

export class PaymentWebhookDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(PaymentProvider)
  provider?: PaymentProvider;

  @ApiPropertyOptional()
  @IsOptional()
  payload?: Record<string, any>;
}

// ---------- REFUND DTO ----------

export class RefundPaymentDto {
  @ApiPropertyOptional({ description: 'Partial refund amount; omit for full refund' })
  @IsOptional()
  @IsNumberString()
  amount?: string;

  @ApiPropertyOptional({ description: 'Reason for refund (stored in audit)' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class PaymentSummaryDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty()
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @ApiProperty()
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  currency: string;

  @ApiPropertyOptional()
  providerOrderId?: string;

  @ApiPropertyOptional()
  providerPaymentId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
