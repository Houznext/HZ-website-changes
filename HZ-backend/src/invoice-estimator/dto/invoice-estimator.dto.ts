import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

class ItemDto {
  @ApiProperty()
  @IsString()
  item_name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  price: number;

  // Align with entity.items structure (area field)
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  area?: number;
}

export class CreateInvoiceEstimatorDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  branchId: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customBuilderId?: string;

  @ApiProperty()
  @IsString()
  billToName: string;

  @ApiProperty()
  @IsString()
  billToAddress: string;

  @ApiProperty()
  @IsString()
  billToCity: string;

  // Flattened ShipTo
  @ApiProperty()
  @IsString()
  shipToAddress: string;

  @ApiProperty()
  @IsString()
  shipToCity: string;

  // Flattened Invoice Info
  @ApiProperty()
  @IsString()
  invoiceNumber: string;

  @ApiProperty()
  @IsString()
  invoiceDate: string;

  @ApiProperty()
  @IsString()
  invoiceDue: string;

  @ApiProperty()
  @IsString()
  invoiceTerms: string;

  @ApiProperty({ type: [ItemDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items?: ItemDto[];
}

export class UpdateInvoiceEstimatorDto {
  @ApiProperty()
  @IsString()
  userId: string; // still from payload, as you prefer

  @ApiProperty()
  @IsString()
  branchId: string; // keep branch context on update as well

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customBuilderId?: string;

  @ApiProperty()
  @IsString()
  billToName: string;

  @ApiProperty()
  @IsNumber()
  subTotal: number;

  @ApiProperty()
  @IsString()
  billToAddress: string;

  @ApiProperty()
  @IsString()
  billToCity: string;

  // Flattened ShipTo
  @ApiProperty()
  @IsString()
  shipToAddress: string;

  @ApiProperty()
  @IsString()
  shipToCity: string;

  // Flattened Invoice Info
  @ApiProperty()
  @IsString()
  invoiceNumber: string;

  @ApiProperty()
  @IsString()
  invoiceDate: string;

  @ApiProperty()
  @IsString()
  invoiceDue: string;

  @ApiProperty()
  @IsString()
  invoiceTerms: string;

  @ApiProperty({ type: [ItemDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items?: ItemDto[];
}


export class InvoiceFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  
  branchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  billToName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  billToCity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shipToCity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoiceDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoiceDue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoiceTerms?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined ? 1 : Number(value),
  )
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined ? 10 : Number(value),
  )
  @IsInt()
  @Min(1)
  limit?: number;
}
