import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ServiceCategory, LeadStatus } from 'src/crm/enums/crm.enum';

/** Structured solar quote payload (for Solar service type). Stored as-is and returned on duplicate. */
export class SolarQuoteSnapshotDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  solarType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  monthlyBill?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  recommendedSystemSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  annualGeneration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  spaceRequired?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  systemCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  subsidy?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  effectiveCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  estimatedAnnualSavings?: number;

  @ApiPropertyOptional({ type: 'array', items: { type: 'object', properties: { tenure: { type: 'number' }, monthlyEmi: { type: 'number' } } } })
  @IsOptional()
  emiOptions?: { tenure: number; monthlyEmi: number }[];
}

export class CreateServiceCustomLeadDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @Matches(/^[6-9]\d{9}$/, {
    message:
      'Phone number must start with 6, 7, 8, or 9, and be 10 digits long',
  })
  @IsString()
  @IsNotEmpty()
  phonenumber: string;

  @ApiProperty({ description: 'Short description or summary (required). For Solar, can be a one-line summary; full quote is in solarQuote.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsEnum(ServiceCategory)
  @IsNotEmpty()
  serviceType: ServiceCategory;

  @ApiPropertyOptional({ description: 'Solar type (residential/commercial)' })
  @IsOptional()
  @IsString()
  solarType?: string;

  @ApiPropertyOptional({ description: 'Solar category (rooftop, industrial, etc.)' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Monthly electricity bill amount' })
  @IsOptional()
  @IsNumber()
  monthlyBill?: number;

  @ApiPropertyOptional({
    description: 'Structured solar quote (for Solar). Stored and returned on duplicate.',
    type: SolarQuoteSnapshotDto,
  })
  @IsOptional()
  @IsObject()
  solarQuote?: Record<string, any>;
}
export class ReturnServiceCustomLeadDto {
  id: number;
  name: string;
  description: string;
  phonenumber: string;
  services: ServiceCategory;
   leadstatus: LeadStatus;
  createdAt: Date;
}
export class UpdateServiceCustomLeadstatusDto {
  @ApiProperty()
  @IsEnum(LeadStatus)
  @IsNotEmpty()
  leadstatus: LeadStatus;
}

