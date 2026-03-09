import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { HomeDecorsCategory } from '../enum/homeDecors.enum';
import { Expose, Transform } from 'class-transformer';

export class CreateHomeDecoreDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  prodDetails: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount: number;

  @ApiProperty({ enum: HomeDecorsCategory })
  @IsEnum(HomeDecorsCategory)
  @IsNotEmpty()
  category: HomeDecorsCategory;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  images: string[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  design: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  shape: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  productQuantity: number;

  

  @ApiProperty()
  @IsNotEmpty()
  otherProperties?: { [key: string]: string };

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  deliveryTime: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  assembly: string;

  @ApiProperty()
  @IsBoolean()
  customizeOptions: boolean;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  warranty: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  deliveryLocations: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  createdById: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ required: false, default: 'INR' })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  hsnCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  gstInclusive?: boolean;

  @ApiProperty({ required: false, type: 'array', items: { type: 'object', properties: { type: {}, title: {}, description: {}, code: {}, validFrom: {}, validTo: {} } } })
  @IsOptional()
  offers?: Array<{ type: string; title: string; description?: string; code?: string; validFrom?: string; validTo?: string }>;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  applicableCouponCodes?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  returnPolicy?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isCODAvailable?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  shippingDetails?: { weight?: number; dimensions?: string };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  searchTags?: string[];
}

export class UpdateHomeDecorDto extends PartialType(CreateHomeDecoreDto) {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  prodDetails?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discount?: number;

  @ApiProperty({ required: false })
  @IsEnum(HomeDecorsCategory)
  @IsOptional()
  category?: HomeDecorsCategory;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  design?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shape?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  productQuantity?: number;

 

  @ApiProperty({ required: false })
  @IsOptional()
  otherProperties?: { [key: string]: string };

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  deliveryTime?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  assembly?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  customizeOptions?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  warranty?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  deliveryLocations?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  updatedById?: string;
}
export class ReturnHomeDecoreDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  price: number;

  @Expose()
  prodDetails: string;

  @Expose()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  discount?: number;

  @Expose()
  @Transform(({ obj }) =>
    obj.discount
      ? parseFloat((obj.price - obj.price * (obj.discount / 100)).toFixed(2))
      : parseFloat(obj.price.toFixed(2)),
    { toClassOnly: true },
  )
  currentPrice: number;

  @Expose()
  category: string;

  @Expose()
  images?: string[];

  @Expose()
  design: string;

  @Expose()
  color: string;

  @Expose()
  shape?: string;

  @Expose()
  productQuantity: number; 

  @Expose()
  otherProperties?: { [key: string]: string };

  @Expose()
  deliveryTime: string;

  @Expose()
  assembly?: string;

  @Expose()
  customizeOptions: boolean;

  @Expose()
  warranty: string;

  @Expose()
  brand: string;

  @Expose()
  deliveryLocations: string;

  @Expose()
  createdDate: Date;

  @Expose()
  updatedDate: Date;

  @Expose()
  createdById?: string;

  @Expose()
  updatedById?: string;

  @Expose()
  slug?: string;

  @Expose()
  isFeatured?: boolean;

  @Expose()
  currencyCode?: string;

  @Expose()
  @Transform(({ value }) => (value != null ? parseFloat(value) : undefined), { toClassOnly: true })
  taxPercentage?: number;

  @Expose()
  hsnCode?: string;

  @Expose()
  gstInclusive?: boolean;

  @Expose()
  offers?: Array<{ type: string; title: string; description?: string; code?: string; validFrom?: string; validTo?: string }>;

  @Expose()
  applicableCouponCodes?: string[];

  @Expose()
  returnPolicy?: string;

  @Expose()
  isCODAvailable?: boolean;

  @Expose()
  shippingDetails?: { weight?: number; dimensions?: string };

  @Expose()
  metaTitle?: string;

  @Expose()
  metaDescription?: string;

  @Expose()
  searchTags?: string[];
}
