import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ConstructionStatus, ListingFor, PropertyType } from '../../common/enums/infra.enums';

export class FilterPropertyDto {
  @IsOptional()
  @IsString()
  city?: string;

  /** Free-text search (title, type, locality, details, property ID, fuzzy spelling). */
  @IsOptional()
  @IsString()
  q?: string;

  /** Soft type boost for search (hero tab); does not hard-filter results when `q` is set. */
  @IsOptional()
  @IsString()
  hintType?: string;

  @IsOptional()
  @IsEnum(PropertyType)
  type?: PropertyType;

  /** Alias for `type` (matches public API query style). */
  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @IsString()
  bhk?: string;

  /** Comma-separated BHK values (e.g. `2BHK,3BHK,5BHK+`). */
  @IsOptional()
  @IsString()
  bhkTypes?: string;

  /** Comma-separated property types (e.g. `Apartment,Villa`). */
  @IsOptional()
  @IsString()
  types?: string;

  /** Comma-separated construction statuses. */
  @IsOptional()
  @IsString()
  statuses?: string;

  /** Comma-separated furnishing values (`Unfurnished`, `Semi-Furnished`, `Fully-Furnished`). */
  @IsOptional()
  @IsString()
  furnishing?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsEnum(ConstructionStatus)
  status?: ConstructionStatus;

  @IsOptional()
  @IsEnum(ListingFor)
  listingFor?: ListingFor;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  isFeatured?: boolean;

  @IsOptional()
  @IsString()
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
