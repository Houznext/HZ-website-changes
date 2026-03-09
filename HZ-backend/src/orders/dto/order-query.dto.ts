import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderQueryStatus } from '../entities/order-query.entity';

export class CreateOrderQueryDto {
  @ApiProperty({ example: 'Refund status for order OC-2025-001' })
  @IsString()
  subject: string;

  @ApiProperty({ example: 'When will I receive my refund for this order?' })
  @IsString()
  message: string;
}

export class UpdateOrderQueryDto {
  @ApiPropertyOptional({ description: 'Admin reply to the user' })
  @IsOptional()
  @IsString()
  reply?: string;

  @ApiPropertyOptional({ enum: OrderQueryStatus })
  @IsOptional()
  @IsEnum(OrderQueryStatus)
  status?: OrderQueryStatus;
}
