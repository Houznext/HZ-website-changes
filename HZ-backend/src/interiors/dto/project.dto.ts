import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsArray,
  IsDateString,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @IsString()
  propertyType: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  totalAreaSqft?: number;

  @IsOptional()
  @IsString()
  bhk?: string;

  @IsOptional()
  @IsString()
  floorNumber?: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  locality: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopesSelected?: string[];

  @IsOptional()
  @IsString()
  stylePreference?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  referenceImagesUrls?: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  totalBudget?: number;

  @IsOptional()
  @IsString()
  budgetNote?: string;

  @IsOptional()
  @IsDateString()
  expectedStartDate?: string;

  @IsOptional()
  @IsDateString()
  expectedEndDate?: string;

  @IsOptional()
  @IsString()
  paymentPreference?: string;

  @IsOptional()
  @IsString()
  specialNotes?: string;

  @IsOptional()
  @IsString()
  floorPlanUrl?: string;

  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  repId?: string;
}

export class GenerateDprDto {
  @IsDateString()
  date: string;
}
