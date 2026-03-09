import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  OrderStatusEnum,
  OrderType,
  ReturnReasonEnum,
} from '../enum/order.enum';

export class OrderItemSummaryDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  productType?: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  mrp: string;

  @ApiProperty()
  sellingPrice: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  taxPercent: string;

  @ApiProperty()
  itemTotal: string;

  @ApiPropertyOptional()
  meta?: Record<string, any>;
}

export class OrderSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderNo: string;

  @ApiProperty()
  type: OrderType;

  @ApiProperty()
  status: OrderStatusEnum;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  subTotal: string;

  @ApiProperty()
  discountTotal: string;

  @ApiProperty()
  taxTotal: string;

  @ApiProperty()
  shippingTotal: string;

  @ApiProperty()
  feeTotal: string;

  @ApiProperty()
  grandTotal: string;

  @ApiProperty()
  amountPaid: string;

  @ApiProperty()
  amountDue: string;

  @ApiPropertyOptional()
  couponCode?: string;

  @ApiPropertyOptional()
  couponDiscount?: string;

  @ApiProperty({ type: () => [OrderItemSummaryDto] })
  items: OrderItemSummaryDto[];

  @ApiPropertyOptional()
  billingDetails?: Record<string, any>;

  @ApiPropertyOptional()
  shippingDetails?: Record<string, any>;

  @ApiPropertyOptional()
  serviceDetails?: Record<string, any>;

  @ApiPropertyOptional()
  taxBreakup?: Record<string, any>;

  @ApiPropertyOptional()
  statusHistory?: any[];

  @ApiPropertyOptional()
  cancelReason?: string;

  @ApiPropertyOptional({ enum: ReturnReasonEnum })
  returnReason?: ReturnReasonEnum;

  @ApiPropertyOptional()
  returnComment?: string;

  @ApiPropertyOptional({ type: [String] })
  returnImages?: string[];

  @ApiPropertyOptional()
  refundAmount?: string;

  @ApiPropertyOptional()
  meta?: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedOrderResponseDto {
  @ApiProperty({ type: () => [OrderSummaryDto] })
  data: OrderSummaryDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
