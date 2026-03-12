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
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PropertyType } from '../../Custombuilder/custom-property/enum/custom-property.enum';
import { EstimationCategory } from '../Enum/cost-estimator.enum';

class ItemDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  id?: number; // Optional for new items

  @ApiProperty()
  @IsString()
  item_name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  unit_price: number;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNumber()
  area: number;
}

export class ItemGroupDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  id?: number; // Optional for new groups

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
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
  @IsNumber()
  @IsOptional()
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
  @IsNumber()
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
  @IsNumber()
  @IsOptional()
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
  @IsNumber()
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
}
