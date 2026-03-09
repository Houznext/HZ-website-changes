import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { PropertyPremiumPlanType } from '../entities/property-premium-plan.entity';

export class CreatePropertyPremiumPlanDto {
  @ApiProperty({ example: 'featured-7-days' })
  @IsString()
  @MaxLength(120)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug must be lowercase alphanumeric and hyphens only' })
  slug: string;

  @ApiProperty({ example: 'Featured – 7 days' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ enum: PropertyPremiumPlanType })
  @IsOptional()
  @IsEnum(PropertyPremiumPlanType)
  planType?: PropertyPremiumPlanType;

  @ApiProperty({ example: 'Featured', description: 'Maps to property.promotionType' })
  @IsString()
  @MaxLength(50)
  promotionType: string;

  @ApiProperty({ example: 499 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 7, default: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  meta?: Record<string, any>;
}
