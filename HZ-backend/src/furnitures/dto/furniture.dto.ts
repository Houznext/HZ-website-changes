// src/furniture/dto/furniture.dto.ts
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
  Min,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { PartialType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Category,
  FurnitureStatus,
  PriceRange,
  SortOption,
} from '../enum/furniture.enum';
import {
  SofaSubCategory,
  BedSubCategory,
  ChairSubCategory,
  TableSubCategory,
  WardrobeSubCategory,
  StudyRoomSubCategory,
  DiningTableSubCategory,
} from '../enum/furniture.enum';
import { Type } from 'class-transformer';

// ---- helper type/constant for subCategories ----
export type AnySubCategory =
  | SofaSubCategory
  | BedSubCategory
  | ChairSubCategory
  | TableSubCategory
  | WardrobeSubCategory
  | StudyRoomSubCategory
  | DiningTableSubCategory;

export const ALL_SUBCATEGORY_VALUES: string[] = [
  ...Object.values(SofaSubCategory),
  ...Object.values(BedSubCategory),
  ...Object.values(ChairSubCategory),
  ...Object.values(TableSubCategory),
  ...Object.values(WardrobeSubCategory),
  ...Object.values(StudyRoomSubCategory),
  ...Object.values(DiningTableSubCategory),
];

// ================= OFFER DTO =================

export class FurnitureOfferDto {
  @ApiProperty({ description: 'Offer type e.g. bank, partner, emi' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Short title e.g. 10% off' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Coupon code if applicable' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Valid from date (ISO string)' })
  @IsOptional()
  @IsString()
  validFrom?: string;

  @ApiPropertyOptional({ description: 'Valid to date (ISO string)' })
  @IsOptional()
  @IsString()
  validTo?: string;
}

// ================= IMAGE DTO =================

export class FurnitureImageDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  colorHex?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  angle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  viewType?: string;
}

// ================= VARIANT DTO =================

export class FurnitureVariantDto {
  @ApiProperty()
  @IsString()
  sku: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  colorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  colorHex?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  finish?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sizeLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  widthCm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  depthCm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  heightCm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxLoadKg?: number;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  stockQty: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  reservedQty?: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  mrp: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  sellingPrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  attributes?: Record<string, any>;

  @ApiPropertyOptional({ type: () => FurnitureImageDto, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FurnitureImageDto)
  images?: FurnitureImageDto[];
}

// ================= CREATE DTO =================

export class CreateFurnitureDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'URL friendly slug',
  })
  @IsString()
  slug: string;

  @ApiProperty({ enum: Category })
  @IsEnum(Category)
  category: Category;

  @ApiPropertyOptional({
    enum: ALL_SUBCATEGORY_VALUES,
    description: 'Sub category; options depend on main Category',
  })
  @IsOptional()
  @IsIn(ALL_SUBCATEGORY_VALUES)
  subCategory?: AnySubCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'JSON string or text of bullet highlights',
  })
  @IsOptional()
  @IsString()
  highlights?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ type: String, isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: FurnitureStatus })
  @IsOptional()
  @IsEnum(FurnitureStatus)
  status?: FurnitureStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCustomizable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customizationDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveryTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  warranty?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assembly?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  returnPolicy?: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  otherProperties?: Record<string, any>;

  @ApiPropertyOptional({ type: () => FurnitureOfferDto, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FurnitureOfferDto)
  offers?: FurnitureOfferDto[];

  @ApiPropertyOptional({ type: String, isArray: true, description: 'Coupon codes applicable to this product (usable with COD)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableCouponCodes?: string[];

  @ApiPropertyOptional({ description: 'Currency code e.g. INR', default: 'INR' })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiPropertyOptional({ description: 'GST / tax percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number;

  @ApiPropertyOptional({ description: 'HSN code for GST' })
  @IsOptional()
  @IsString()
  hsnCode?: string;

  @ApiPropertyOptional({ description: 'Whether price is GST inclusive' })
  @IsOptional()
  @IsBoolean()
  gstInclusive?: boolean;

  @ApiPropertyOptional({ description: 'Cash on Delivery available; coupons still apply to order' })
  @IsOptional()
  @IsBoolean()
  isCODAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Delivery coverage e.g. All India' })
  @IsOptional()
  @IsString()
  deliveryLocations?: string;

  @ApiPropertyOptional({ description: 'Shipping weight (kg) and dimensions' })
  @IsOptional()
  shippingDetails?: { weight?: number; dimensions?: string };

  @ApiPropertyOptional({ description: 'SEO meta title' })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'SEO meta description' })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ type: String, isArray: true, description: 'Search tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  searchTags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiProperty({ type: () => FurnitureVariantDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FurnitureVariantDto)
  variants: FurnitureVariantDto[];

  @ApiPropertyOptional({ type: () => FurnitureImageDto, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FurnitureImageDto)
  images?: FurnitureImageDto[];
}

export class UpdateFurnitureDto extends PartialType(CreateFurnitureDto) { }

// ================= FILTER DTO =================

export class FilterFurnitureDto {
  @ApiPropertyOptional({ enum: Category })
  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @ApiPropertyOptional({
    enum: ALL_SUBCATEGORY_VALUES,
  })
  @IsOptional()
  @IsIn(ALL_SUBCATEGORY_VALUES)
  subCategory?: AnySubCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ enum: PriceRange })
  @IsOptional()
  @IsEnum(PriceRange)
  priceRange?: PriceRange;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({ enum: SortOption })
  @IsOptional()
  @IsEnum(SortOption)
  sort?: SortOption;

  @ApiPropertyOptional({
    description: 'Search query (name, brand, etc.)',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by branch ID' })
  @IsOptional()
  @IsString()
  branchId?: string;
}

// ================= RETURN DTOs =================

export class ReturnFurnitureVariantDto extends FurnitureVariantDto {
  @ApiProperty()
  id: string;
}

export class ReturnFurnitureImageDto extends FurnitureImageDto {
  @ApiProperty()
  id: string;
}

export class ReturnFurnitureDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ enum: Category })
  category: Category;

  @ApiPropertyOptional({ enum: ALL_SUBCATEGORY_VALUES })
  subCategory?: AnySubCategory;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  highlights?: string;

  @ApiPropertyOptional()
  brand?: string;

  @ApiPropertyOptional({ type: String, isArray: true })
  tags?: string[];

  @ApiProperty()
  baseMrp: number;

  @ApiProperty()
  baseSellingPrice: number;

  @ApiProperty()
  baseDiscountPercent: number;

  @ApiProperty()
  ratingCount: number;

  @ApiProperty()
  averageRating: number;

  @ApiProperty({ enum: FurnitureStatus })
  status: FurnitureStatus;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty()
  isCustomizable: boolean;

  @ApiPropertyOptional()
  customizationDescription?: string;

  @ApiPropertyOptional()
  deliveryTime?: string;

  @ApiPropertyOptional()
  warranty?: string;

  @ApiPropertyOptional()
  assembly?: string;

  @ApiPropertyOptional()
  returnPolicy?: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
  })
  otherProperties?: Record<string, any>;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        code: { type: 'string' },
        validFrom: { type: 'string' },
        validTo: { type: 'string' },
      },
    },
  })
  offers?: FurnitureOfferDto[];

  @ApiPropertyOptional({ type: String, isArray: true })
  applicableCouponCodes?: string[];

  @ApiPropertyOptional()
  currencyCode?: string;

  @ApiPropertyOptional()
  taxPercentage?: number;

  @ApiPropertyOptional()
  hsnCode?: string;

  @ApiPropertyOptional()
  gstInclusive?: boolean;

  @ApiPropertyOptional()
  isCODAvailable?: boolean;

  @ApiPropertyOptional()
  deliveryLocations?: string;

  @ApiPropertyOptional()
  shippingDetails?: { weight?: number; dimensions?: string };

  @ApiPropertyOptional()
  metaTitle?: string;

  @ApiPropertyOptional()
  metaDescription?: string;

  @ApiPropertyOptional({ type: String, isArray: true })
  searchTags?: string[];

  @ApiPropertyOptional()
  sellerId?: string;

  @ApiProperty()
  createdDate: Date;

  @ApiProperty()
  updatedDate: Date;

  @ApiProperty({ type: () => ReturnFurnitureVariantDto, isArray: true })
  variants: ReturnFurnitureVariantDto[];

  @ApiProperty({ type: () => ReturnFurnitureImageDto, isArray: true })
  images: ReturnFurnitureImageDto[];
}
