import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ConstructionStatus, ListingFor, PropertyType } from '../../common/enums/infra.enums';

export class CreatePropertyDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @IsEnum(ListingFor)
  listingFor: ListingFor;

  @IsEnum(ConstructionStatus)
  constructionStatus: ConstructionStatus;

  @IsOptional()
  @IsString()
  bhkType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  carpetArea?: number;

  @IsOptional()
  @IsString()
  areaUnit?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  basePrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pricePerUnit?: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  reraNumber?: string;

  @IsOptional()
  @IsString()
  facing?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  floor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalFloors?: number;

  @IsOptional()
  @IsString()
  furnishingStatus?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @IsOptional()
  @IsString()
  possessionDate?: string;

  @IsOptional()
  @IsString()
  listedBy?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
