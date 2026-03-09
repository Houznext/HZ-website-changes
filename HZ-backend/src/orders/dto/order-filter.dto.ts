import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { OrderItemType, OrderStatusEnum, OrderType } from "../enum/order.enum";
import { IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class FilterOrdersDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(OrderStatusEnum)
  status?: OrderStatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(OrderType)
  type?: OrderType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiPropertyOptional({ description: 'Search by orderNo, user name, item name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter orders containing a productType' })
  @IsOptional()
  @IsEnum(OrderItemType)
  productType?: OrderItemType;

  @ApiPropertyOptional({ description: 'Filter orders containing a productId' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ description: 'From date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'To date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Min grand total' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minAmount?: number;

  @ApiPropertyOptional({ description: 'Max grand total' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Sort field: createdAt | grandTotal | orderNo | status | updatedAt' })
  @IsOptional()
  @IsIn(['createdAt', 'grandTotal', 'orderNo', 'status', 'updatedAt'])
  sortBy?: 'createdAt' | 'grandTotal' | 'orderNo' | 'status' | 'updatedAt';

  @ApiPropertyOptional({ description: 'Sort direction: ASC | DESC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({ description: 'Quick date filter: last7days | last30days | last90days' })
  @IsOptional()
  @IsIn(['last7days', 'last30days', 'last90days'])
  datePreset?: 'last7days' | 'last30days' | 'last90days';
}