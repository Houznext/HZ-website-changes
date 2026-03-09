import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFloorplanDto {
  @ApiProperty({ example: 'cb-plan-174005' })
  @IsString()
  @MaxLength(120)
  planId: string;

  @ApiPropertyOptional({ example: 'v1' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  variantId?: string;

  @ApiPropertyOptional({ example: 'property-123' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  propertyId?: string;

  @ApiPropertyOptional({ example: 'cb-123' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  customBuilderId?: string;

  @ApiProperty({ description: 'Final SVG markup to render floorplan' })
  @IsString()
  svgData: string;

  @ApiPropertyOptional({ type: 'object' })
  @IsOptional()
  @IsObject()
  placedPlan?: Record<string, unknown>;

  @ApiPropertyOptional({ type: 'object' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  warnings?: string[];
}

export class UpdateFloorplanDto extends PartialType(CreateFloorplanDto) {}
