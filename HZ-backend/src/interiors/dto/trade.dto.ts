import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCheckpointDto {
  @IsString()
  checkpointName: string;

  @IsOptional()
  isMandatory?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sequence?: number;
}

export class CreateTradeTemplateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  iconName?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  defaultWeightage?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sortOrder?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCheckpointDto)
  checkpoints: CreateCheckpointDto[];
}

export class AddTradeToProjectDto {
  @IsString()
  templateId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateTradeDto)
  overrides?: Partial<UpdateTradeDto>;
}

export class UpdateTradeDto {
  @IsOptional()
  @IsString()
  customName?: string;

  @IsOptional()
  @IsString()
  assignedVendorName?: string;

  @IsOptional()
  @IsString()
  assignedVendorPhone?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  overallProgress?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weightage?: number;

  @IsOptional()
  @IsDateString()
  plannedStartDate?: string;

  @IsOptional()
  @IsDateString()
  plannedEndDate?: string;

  @IsOptional()
  @IsDateString()
  actualStartDate?: string;

  @IsOptional()
  @IsDateString()
  actualEndDate?: string;
}
