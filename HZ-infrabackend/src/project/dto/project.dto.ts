import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ConstructionStatus } from '../../common/enums/infra.enums';

export class CreateProjectDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  reraNumber?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalUnits?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  availableUnits?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  towers?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxFloors?: number;

  @IsOptional()
  @IsString()
  possessionDate?: string;

  @IsEnum(ConstructionStatus)
  status: ConstructionStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  heroImageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  reraNumber?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalUnits?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  availableUnits?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  towers?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxFloors?: number;

  @IsOptional()
  @IsString()
  possessionDate?: string;

  @IsOptional()
  @IsEnum(ConstructionStatus)
  status?: ConstructionStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  heroImageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class MilestoneDto {
  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortOrder?: number;
}

export class CreateMilestonesBodyDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MilestoneDto)
  milestones: MilestoneDto[];
}
