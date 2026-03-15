import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  IsArray,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LabourEntryDto {
  @IsString()
  tradeType: string;

  @IsInt()
  @Type(() => Number)
  count: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  hoursWorked?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  wagePerDay?: number;
}

export class MaterialUsageDto {
  @IsString()
  materialName: string;

  @IsOptional()
  @IsString()
  brandName?: string;

  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @IsString()
  unit: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  unitCost?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  totalCost?: number;
}

export class AddDailyUpdateDto {
  @IsDateString()
  updateDate: string;

  @IsNumber()
  @Type(() => Number)
  progressDelta: number;

  @IsNumber()
  @Type(() => Number)
  cumulativeProgress: number;

  @IsOptional()
  @IsString()
  supervisorName?: string;

  @IsOptional()
  @IsString()
  stageLabel?: string;

  @IsOptional()
  @IsString()
  workDoneToday?: string;

  @IsOptional()
  @IsString()
  tomorrowPlan?: string;

  @IsOptional()
  @IsString()
  blockerNote?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  labourCount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  totalExpenditureToday?: number;

  @IsString()
  tradeId: string;

  @IsString()
  projectId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabourEntryDto)
  labourEntries?: LabourEntryDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialUsageDto)
  materialUsages?: MaterialUsageDto[];
}
