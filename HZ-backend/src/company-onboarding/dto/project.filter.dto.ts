import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsEnum,
  IsArray,
  IsDateString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PromotionTagEnum, PromotionTypeEnum } from '../Enum/company.enum';

// Helper: Normalize any input into a cleaned array of lowercase strings
const normalizeToArray = ({ value }) => {
  if (!value) return [];
  const arr = Array.isArray(value) ? value : [value];
  return [
    ...new Set(
      arr.map((v) => v?.toString().trim().toLowerCase()).filter(Boolean),
    ),
  ];
};

export class ProjectFilterDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  @Transform(normalizeToArray)
  city?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  @Transform(normalizeToArray)
  locality?: string[];

  @ApiPropertyOptional({ type: String, description: 'LocationDetails UUID for exact locality filter' })
  @IsOptional()
  @IsString()
  localityId?: string;

  @ApiPropertyOptional({ type: String, description: 'Company/builder UUID filter' })
  @IsOptional()
  @IsString()
  builderId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  @Transform(normalizeToArray)
  propertytype?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  @Transform(normalizeToArray)
  bhkType?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  @Transform(normalizeToArray)
  facing?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(PromotionTypeEnum, { each: true })
  @Transform(normalizeToArray)
  promotionType?: PromotionTypeEnum[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(PromotionTagEnum, { each: true })
  @Transform(normalizeToArray)
  promotionTags?: PromotionTagEnum[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  @Transform(normalizeToArray)
  constructionStatus?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  @Transform(normalizeToArray)
  ageOfProperty?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  @Transform(normalizeToArray)
  priceRange?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  @Transform(normalizeToArray)
  buildupArea?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  @Transform(normalizeToArray)
  amenities?: string[];

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 10;
}

export class CompanyPromotionUpdateDto {
  @ApiProperty()
  @IsArray()
  @IsEnum(PromotionTypeEnum, { each: true })
  @IsOptional()
  promotionType?: PromotionTypeEnum[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  @IsEnum(PromotionTagEnum, { each: true })
  promotionTags?: PromotionTagEnum[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  promotionExpiry?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export interface PopularBuilderDto {
  id: string;
  slug: string;
  companyName: string;
  logo: string | null;
  totalProjects: number;
  projectsInCity: number;
}
