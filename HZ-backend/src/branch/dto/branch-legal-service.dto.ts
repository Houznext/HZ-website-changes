import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsIn,
  MaxLength,
  Min,
} from 'class-validator';

export const BRANCH_LEGAL_SERVICE_KINDS = ['package', 'service'] as const;
export type BranchLegalServiceKindDto = (typeof BRANCH_LEGAL_SERVICE_KINDS)[number];

export class CreateBranchLegalServiceDto {
  @ApiProperty({ example: 'Property Title Verification' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ enum: ['package', 'service'], default: 'package' })
  @IsIn(BRANCH_LEGAL_SERVICE_KINDS)
  kind: BranchLegalServiceKindDto;

  @ApiProperty({
    example: ['Complete title search', 'EC check', 'Legal opinion report'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiProperty({ example: 4999 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 7999 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiPropertyOptional({ example: 18, description: 'GST percentage (e.g. 18 for 18%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  gstPercent?: number;

  @ApiPropertyOptional({ default: true, description: 'Whether price is inclusive of GST' })
  @IsOptional()
  @IsBoolean()
  gstInclusive?: boolean;

  @ApiPropertyOptional({ example: 'Book Now' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  buttonText?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Image URLs (S3)', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiPropertyOptional({ example: 'LEGAL20', description: 'Coupon code' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  couponCode?: string;

  @ApiPropertyOptional({ enum: ['percent', 'fixed'] })
  @IsOptional()
  @IsIn(['percent', 'fixed'])
  discountType?: 'percent' | 'fixed';

  @ApiPropertyOptional({ example: 20, description: 'Discount % or fixed amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @ApiPropertyOptional({ description: 'Offer valid from (ISO date)' })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({ description: 'Offer valid to (ISO date)' })
  @IsOptional()
  @IsDateString()
  validTo?: string;
}

export class UpdateBranchLegalServiceDto {
  @ApiPropertyOptional({ example: 'Property Title Verification' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ enum: ['package', 'service'] })
  @IsOptional()
  @IsIn(BRANCH_LEGAL_SERVICE_KINDS)
  kind?: BranchLegalServiceKindDto;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ example: 4999 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 7999 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiPropertyOptional({ example: 18, description: 'GST percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  gstPercent?: number;

  @ApiPropertyOptional({ description: 'Whether price is inclusive of GST' })
  @IsOptional()
  @IsBoolean()
  gstInclusive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  buttonText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  couponCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['percent', 'fixed'])
  discountType?: 'percent' | 'fixed';

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validTo?: string;
}
