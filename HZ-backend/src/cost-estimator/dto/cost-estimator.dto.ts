import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsDecimal,
  IsOptional,
  IsEmail,
  IsEnum,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PropertyType } from '../../livebuild/custom-property/enum/custom-property.enum';
import { EstimationCategory } from '../Enum/cost-estimator.enum';

class ItemDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id?: number; // Optional for new items

  @ApiProperty()
  @IsString()
  item_name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  unit_price: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  amount: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  area: number;
}

export class ItemGroupDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id?: number; // Optional for new groups

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  order: number;

  @ApiProperty({ type: [ItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];
}

class LocationDto {
  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  state?: string;

  @ApiProperty()
  @IsString()
  locality: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  sub_locality?: string;

  @ApiProperty()
  @IsString()
  landmark: string;

  @ApiProperty()
  @IsString()
  pincode: string;

  @ApiProperty()
  @IsString()
  address_line_1: string;
}

export class CreateCostEstimatorDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsString()
  firstname: string;

  @ApiProperty()
  @IsString()
  lastname: string;
  @ApiProperty()
  @IsEnum(EstimationCategory)
  category: EstimationCategory;
 

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false })
  phone?: number;

  @ApiProperty()
  @IsString()
  date: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  designerName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  bhk?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  property_name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  floor_plan?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  property_image?: string;

  @ApiProperty({
    enum: PropertyType,
    default: PropertyType.Apartment,
  })
  @IsEnum(PropertyType)
  @IsOptional()
  property_type: PropertyType;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber({ allowNaN: false })
  subTotal: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  details?: string;

  @ApiProperty({ type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ type: [ItemGroupDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemGroupDto)
  itemGroups: ItemGroupDto[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  discount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === 1 || value === '1') return true;
    if (value === 'false' || value === 0 || value === '0') return false;
    return Boolean(value);
  })
  @IsBoolean()
  gstEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, maxDecimalPlaces: 4 })
  gstPercentage?: number;
}

export class UpdateCostEstimatorDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  firstname?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastname?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  designerName?: string;

  @ApiProperty()
  @IsEnum(EstimationCategory)
  @IsOptional()
  category?: EstimationCategory;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false })
  phone?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  bhk?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  property_name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  floor_plan?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  property_image?: string;

  @ApiProperty({
    enum: PropertyType,
    default: PropertyType.Apartment,
  })
  @IsOptional()
  @IsEnum(PropertyType)
  property_type?: PropertyType;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false })
  subTotal?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  details?: string;

  @ApiProperty({ type: [ItemGroupDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ItemGroupDto)
  itemGroups?: ItemGroupDto[];

  @ApiProperty({ type: LocationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @ApiProperty()
  @IsString()
  @IsOptional()
  discount?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === 1 || value === '1') return true;
    if (value === 'false' || value === 0 || value === '0') return false;
    return Boolean(value);
  })
  @IsBoolean()
  gstEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, maxDecimalPlaces: 4 })
  gstPercentage?: number;
}
