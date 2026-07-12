import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddTradeToProjectDto {
  @IsString()
  customName: string;

  @IsOptional()
  @IsString()
  assignedVendorName?: string;

  @IsOptional()
  @IsString()
  assignedVendorPhone?: string;

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
