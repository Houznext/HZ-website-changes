// src/Custombuilder/dto/phases-and-progress.dtos.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { DailyProgressStatus } from 'src/Custombuilder/daily-progress/enum/daily-progress.enum';

/* ----------------------------- PHASES: DTOs ----------------------------- */

export class CreatePhaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  order: number;

  @ApiProperty({ example: 'Foundation' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @ApiProperty({ example: 15 })
  @IsInt()
  @Min(0)
  plannedDays: number;

  @ApiPropertyOptional({ example: 350000 })
  @IsOptional()
  @IsNumber()
  plannedCost?: number | null;

  @ApiPropertyOptional({ example: '2025-07-01' })
  @IsOptional()
  @IsDateString()
  plannedStart?: string | null;

  @ApiPropertyOptional({ example: '2025-07-16' })
  @IsOptional()
  @IsDateString()
  plannedEnd?: string | null;
}

export class UpdatePhaseDto extends PartialType(CreatePhaseDto) {}

export class AutoGeneratePhasesDto {
  @ApiProperty({ enum: ['weighted', 'equal'], example: 'weighted' })
  @IsString()
  mode: 'weighted' | 'equal';

  @ApiPropertyOptional({ type: [String], example: ['Phase 1', 'Phase 2'] })
  @IsOptional()
  @IsArray()
  @Type(() => String)
  names?: string[];
}

/* ----------------------- DAILY PROGRESS: DTOs --------------------------- */

export class MaterialItemDto {
  @ApiProperty({ description: 'Material name', example: 'Cement (OPC 53)' })
  @IsString()
  material: string;

  @ApiProperty({ description: 'Quantity used', example: 20, minimum: 1 })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: 'Short description or spec',
    example: 'For footing PCC',
  })
  @IsString()
  desc: string;
}

export class CreateDailyProgressDto {
  @ApiProperty({
    description: 'Sequential day number for this project',
    example: 9,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  day: number;

  @ApiProperty({ description: 'Work date (ISO)', example: '2025-07-01' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ description: 'Floor index (0 = Ground)', example: 0 })
  @IsOptional()
  @IsInt()
  floor?: number | null;

  @ApiPropertyOptional({
    description: 'Work description / notes',
    example: 'PCC for footings completed',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Uploaded media URLs (images/videos)',
    type: [String],
    example: ['https://s3.ap-south-1.amazonaws.com/bucket/img1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageOrVideo?: string[];

  @ApiProperty({
    description: 'Current status of the work item',
    enum: DailyProgressStatus,
    example: DailyProgressStatus.InProgress,
  })
  @IsEnum(DailyProgressStatus)
  status: DailyProgressStatus;

  @ApiPropertyOptional({
    description:
      'Type of work being performed. If you send a scalar, backend normalizes to array.',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: 'borewells',
  })
  @IsOptional()
  workType?: string | string[];

  @ApiPropertyOptional({
    description:
      'Where the work happened (room/area). Backend normalizes to array.',
    type: [String],
    example: ['whole_property'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  placeType?: string[];

  @ApiPropertyOptional({
    description: 'Issues faced on site',
    example: 'Water table high, dewatering required',
  })
  @IsOptional()
  @IsString()
  issues?: string;

  @ApiPropertyOptional({
    description: 'Materials used today',
    type: [MaterialItemDto],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MaterialItemDto)
  materials?: MaterialItemDto[];

  @ApiPropertyOptional({
    description: 'Number of labours present',
    example: 12,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  laborCount?: number | null;

  @ApiPropertyOptional({
    description: 'Expenses incurred today',
    example: 4500.5,
  })
  @IsOptional()
  @IsNumber()
  expensesIncurred?: number | null;

  @ApiPropertyOptional({
    description: 'Notes visible to customer',
    example: 'Site cleaned; next: rebar placement',
  })
  @IsOptional()
  @IsString()
  customerNotes?: string;

  @ApiPropertyOptional({
    description: 'Room type (for interiors)',
    example: 'living_room',
  })
  @IsOptional()
  @IsString()
  roomType?: string;

  @ApiPropertyOptional({
    description: 'Feature type (for interiors)',
    example: 'tv_unit',
  })
  @IsOptional()
  @IsString()
  featureType?: string;

  @ApiPropertyOptional({
    description:
      'Phase ID this log belongs to. If omitted, server infers from workType.',
    example: 3,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  phaseId?: number | null;

  /* Normalization helpers (optional) */
  @Transform(
    ({ value }) => (Array.isArray(value) ? value : value ? [value] : []),
    { toClassOnly: true },
  )
  workTypeNorm?: string[];
}

export class UpdateDailyProgressDto extends PartialType(
  CreateDailyProgressDto,
) {}
