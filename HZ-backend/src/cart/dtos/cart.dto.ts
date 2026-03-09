import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from 'src/orders/enum/order.enum';

export class AddressDto {
  @IsString() line1: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  landmark?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;
}

export class PartyDto {
  @IsString() name: string;
  @IsString() phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gstin?: string;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}

export class ShippingDetailsDto {
  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  deliveryAddress?: AddressDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  courierName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  trackingId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shippedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveredAt?: string;
}

export class ServiceDetailsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scheduleDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timeSlot?: string;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  siteAddress?: AddressDto;

  @ApiPropertyOptional()
  @IsOptional()
  assignedToUserId?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serviceStartAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serviceEndAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class TaxBreakupDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gstin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  placeOfSupplyState?: string;

  @ApiPropertyOptional()
  @IsOptional()
  isIGST?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  cgstPercent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  sgstPercent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  igstPercent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  cgstAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  sgstAmount?: number;
  @ApiPropertyOptional()
  @IsOptional()
  igstAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCartMetaDto {
  @ApiPropertyOptional({ enum: OrderType })
  @IsOptional()
  @IsEnum(OrderType)
  type?: OrderType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ type: PartyDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartyDto)
  billingDetails?: PartyDto;

  @ApiPropertyOptional({ type: ShippingDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingDetailsDto)
  shippingDetails?: ShippingDetailsDto;

  @ApiPropertyOptional({ type: ServiceDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceDetailsDto)
  serviceDetails?: ServiceDetailsDto;

  @ApiPropertyOptional({ type: TaxBreakupDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TaxBreakupDto)
  taxBreakup?: TaxBreakupDto;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}

export class ApplyCouponDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;
}
