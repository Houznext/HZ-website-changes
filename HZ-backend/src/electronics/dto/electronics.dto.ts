import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  Min,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsString,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ElectronicsCategory } from '../enum/electronics.enum';

// ================= IMAGE DTO =================

export class ElectronicsImageDto {
  @ApiProperty()
  @IsString()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

// ================= VARIANT DTO =================

export class ElectronicsVariantDto {
  @ApiProperty()
  @IsString()
  sku: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sizeLabel?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  originalPrice: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  discount: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [ElectronicsImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ElectronicsImageDto)
  images?: ElectronicsImageDto[];
}

// ================= CREATE DTO =================

export class CreateElectronicsDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  isFeatured?: boolean;

  @ApiProperty()
  @IsNotEmpty()
  currencyCode: string;

  @ApiProperty()
  @IsNumber()
  taxPercentage: number;

  @ApiPropertyOptional()
  @IsOptional()
  hsnCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  gstInclusive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  offers?: Array<{
    type: string;
    title: string;
    description?: string;
    code?: string;
    validFrom?: string;
    validTo?: string;
  }>;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  applicableCouponCodes?: string[];

  @ApiProperty()
  @IsNotEmpty()
  prodDetails: string;

  @ApiProperty({ enum: ElectronicsCategory })
  @IsEnum(ElectronicsCategory)
  category: ElectronicsCategory;

  @ApiProperty({ type: [ElectronicsVariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ElectronicsVariantDto)
  variants: ElectronicsVariantDto[];

  @ApiPropertyOptional({ type: [ElectronicsImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ElectronicsImageDto)
  images?: ElectronicsImageDto[];

  @ApiProperty()
  @IsNotEmpty()
  brand: string;

  @ApiProperty()
  @IsNotEmpty()
  modelNumber: string;

  @ApiProperty()
  warranty: string;

  @ApiPropertyOptional()
  @IsOptional()
  energyRating?: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  stockAlertThreshold: number;

  @ApiProperty()
  @IsNotEmpty()
  deliveryTime: string;

  @ApiProperty()
  @IsBoolean()
  installationRequired: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  installationGuide?: string;

  @ApiProperty()
  @IsBoolean()
  smartFeatures: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  powerConsumption?: string;

  @ApiPropertyOptional()
  @IsOptional()
  returnPolicy?: string;

  @ApiProperty()
  @IsBoolean()
  isPublished: boolean;

  @ApiProperty()
  @IsBoolean()
  isCODAvailable: boolean;

  @ApiProperty()
  shippingDetails: {
    weight: number;
    dimensions: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metaDescription?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  searchTags?: string[];

  @ApiProperty()
  @IsNotEmpty()
  deliveryLocations: string;

  @ApiProperty()
  @IsNotEmpty()
  createdById: string;
}

// ================= UPDATE DTO =================

export class UpdateElectronicsVariantDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sizeLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [ElectronicsImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ElectronicsImageDto)
  images?: ElectronicsImageDto[];
}

export class UpdateElectronicsDto {
  @ApiPropertyOptional()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  currencyCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  taxPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  hsnCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  gstInclusive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  offers?: Array<{
    type: string;
    title: string;
    description?: string;
    code?: string;
    validFrom?: string;
    validTo?: string;
  }>;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  applicableCouponCodes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  prodDetails?: string;

  @ApiPropertyOptional({ enum: ElectronicsCategory })
  @IsOptional()
  @IsEnum(ElectronicsCategory)
  category?: ElectronicsCategory;

  @ApiPropertyOptional({ type: [UpdateElectronicsVariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateElectronicsVariantDto)
  variants?: UpdateElectronicsVariantDto[];

  @ApiPropertyOptional({ type: [ElectronicsImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ElectronicsImageDto)
  images?: ElectronicsImageDto[];

  @ApiPropertyOptional()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  modelNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  warranty?: string;

  @ApiPropertyOptional()
  @IsOptional()
  energyRating?: string;

  @ApiPropertyOptional()
  @IsOptional()
  stockAlertThreshold?: number;

  @ApiPropertyOptional()
  @IsOptional()
  deliveryTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  installationRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  installationGuide?: string;

  @ApiPropertyOptional()
  @IsOptional()
  smartFeatures?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  powerConsumption?: string;

  @ApiPropertyOptional()
  @IsOptional()
  returnPolicy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  isCODAvailable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  shippingDetails?: {
    weight: number;
    dimensions: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metaDescription?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  searchTags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  deliveryLocations?: string;
}

// ================= RETURN DTO =================

export interface ElectronicsVariantReturnDto {
  id: string;
  sku: string;
  color?: string;
  sizeLabel?: string;
  originalPrice: number;
  discount: number;
  stockQuantity: number;
  isDefault: boolean;
  isActive: boolean;
  attributes?: Record<string, any>;
  images: Array<{
    id: string;
    url: string;
    alt?: string;
    sortOrder: number;
    isPrimary: boolean;
  }>;
}

export interface ElectronicsImageReturnDto {
  id: string;
  url: string;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ReturnElectronicsDto {
  id: string;
  name: string;
  slug?: string;
  isFeatured?: boolean;
  baseOriginalPrice: number;
  baseDiscount: number;
  currencyCode: string;
  taxPercentage: number;
  hsnCode?: string;
  gstInclusive?: boolean;
  offers?: Array<{
    type: string;
    title: string;
    description?: string;
    code?: string;
    validFrom?: string;
    validTo?: string;
  }>;
  applicableCouponCodes?: string[];
  prodDetails: string;
  category: ElectronicsCategory;
  brand: string;
  modelNumber: string;
  warranty: string;
  energyRating?: string;
  stockAlertThreshold: number;
  technicalSpecifications?: { [key: string]: string };
  deliveryTime: string;
  installationRequired: boolean;
  installationGuide?: string;
  smartFeatures: boolean;
  powerConsumption?: string;
  returnPolicy?: string;
  isPublished: boolean;
  isCODAvailable: boolean;
  shippingDetails?: { weight: number; dimensions: string };
  metaTitle?: string;
  metaDescription?: string;
  searchTags?: string[];
  deliveryLocations: string;
  createdDate: Date;
  updatedDate: Date;
  createdById?: string;
  updatedById?: string;
  variants: ElectronicsVariantReturnDto[];
  images: ElectronicsImageReturnDto[];
}
