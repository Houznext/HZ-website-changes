import { PartialType } from '@nestjs/swagger';
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
import { ConstructionStatus, ProjectType } from '../../common/enums/infra.enums';

export class ProjectJsonFieldsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  approvedBanks?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  configurations?: Record<string, unknown>[];

  @IsOptional()
  infrastructure?: Record<string, unknown>[];

  @IsOptional()
  legal?: Record<string, string>;

  @IsOptional()
  roadWidths?: { label: string; width: string }[];

  @IsOptional()
  landmarks?: { name: string; distance: string }[];

  @IsOptional()
  faqs?: { q: string; a: string }[];

  @IsOptional()
  developerInfo?: {
    name?: string;
    founded?: string;
    location?: string;
    highlights?: string[];
  };
}

export class CreateProjectDto extends ProjectJsonFieldsDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsEnum(ProjectType)
  projectType?: ProjectType;

  @IsOptional()
  @IsString()
  developerName?: string;

  @IsOptional()
  @IsString()
  refCode?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsBoolean()
  showInSearch?: boolean;

  @IsOptional()
  @IsBoolean()
  reraVerified?: boolean;

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
  pricePerUnitLabel?: string;

  @IsOptional()
  @IsString()
  unitsLabel?: string;

  @IsOptional()
  @IsString()
  configLabel?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  bankCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  enquiryCount?: number;

  @IsOptional()
  @IsString()
  gradientBg?: string;

  @IsOptional()
  @IsString()
  accentColor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  constructionProgress?: number;

  @IsOptional()
  @IsString()
  visibility?: string;

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

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class ListProjectFiltersDto {
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsEnum(ProjectType)
  projectType?: ProjectType;

  @IsOptional()
  @IsString()
  city?: string;

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
  @IsBoolean()
  showInSearch?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
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
