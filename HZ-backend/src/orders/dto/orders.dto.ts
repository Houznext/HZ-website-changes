import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  OrderItemType,
  OrderStatusEnum,
  OrderType,
  ReturnReasonEnum,
} from '../enum/order.enum';

// -------------------- CREATE --------------------

export class CreateOrderItemDto {
  @ApiProperty({ enum: OrderItemType })
  @IsEnum(OrderItemType)
  productType: OrderItemType;

  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  // NEW: MRP + SELLING
  @ApiProperty({ description: 'MRP per unit', example: 1000 })
  @IsNumber()
  @Min(0)
  mrp: number;

  @ApiProperty({ description: 'Selling price per unit', example: 850 })
  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @ApiPropertyOptional({ description: 'Tax percent for this item', example: 18 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercent?: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'snapshot/meta for rendering & specs' })
  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}

export class CreateOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiProperty({ enum: OrderType })
  @IsEnum(OrderType)
  type: OrderType;

  @ApiPropertyOptional({ default: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string = 'INR';

  @ApiPropertyOptional({ description: 'Order-level coupon code' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ description: 'Order-level coupon discount amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  couponDiscount?: number;

  @ApiPropertyOptional({ description: 'Shipping total (for physical goods)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingTotal?: number;

  @ApiPropertyOptional({ description: 'Platform/convenience fee total' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  feeTotal?: number;

  @ApiProperty({ type: () => [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;

  // optionally allow these json blocks via meta or direct later
}

// -------------------- CREATE FROM CART --------------------

export class CreateOrderFromCartDto {
  @ApiPropertyOptional({
    enum: ['RAZORPAY', 'COD'],
    description: 'Payment method. Use COD for Cash on Delivery; order will be marked paid and CONFIRMED.',
  })
  @IsOptional()
  @IsString()
  @IsIn(['RAZORPAY', 'COD'])
  paymentMethod?: 'RAZORPAY' | 'COD';
}

// -------------------- UPDATE STATUS --------------------

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatusEnum })
  @IsEnum(OrderStatusEnum)
  status: OrderStatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: 'Courier name (Delhivery, Bluedart, etc.) when status is SHIPPED/OUT_FOR_DELIVERY' })
  @IsOptional()
  @IsString()
  courierName?: string;

  @ApiPropertyOptional({ description: 'Tracking ID / AWB when status is SHIPPED/OUT_FOR_DELIVERY' })
  @IsOptional()
  @IsString()
  trackingId?: string;
}

// -------------------- UPDATE ORDER (DETAILS) --------------------

export class UpdateOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  couponDiscount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingTotal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  feeTotal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  billingDetails?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  shippingDetails?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  serviceDetails?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  taxBreakup?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}

// -------------------- FILTERS --------------------



// -------------------- RETURN FLOW --------------------

export class RequestReturnDto {
  @ApiProperty({ enum: ReturnReasonEnum })
  @IsEnum(ReturnReasonEnum)
  reason: ReturnReasonEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'S3 URLs of return images',
  })
  @IsOptional()
  @IsArray()
  images?: string[];
}

export class ProcessReturnDto {
  @ApiProperty()
  @IsBoolean()
  approve: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class CancelOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}