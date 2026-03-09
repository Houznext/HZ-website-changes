import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { facingType, PurposeType } from 'src/property/enums/property.enum';
import {
  AreaUnit,
  ConstructionScope,
  GateDirection,
  PropertyType,
  CommercialPropertyType,
} from '../enum/custom-property.enum';
import { CreateFloorDto } from 'src/Custombuilder/floor/dto/floor.dto';
import { Type } from 'class-transformer';
import { SizeWithUnitDto } from 'src/company-onboarding/dto/company-onboarding.dto';

export class HouseConstructionDto {
  @ApiProperty({ type: SizeWithUnitDto })
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  total_area: SizeWithUnitDto;

  @ApiProperty()
  @IsNumber()
  adjacent_roads: number;

  @ApiProperty({ type: SizeWithUnitDto })
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  length: SizeWithUnitDto;

  @ApiProperty({ type: SizeWithUnitDto })
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  width: SizeWithUnitDto;

  @ApiProperty({ type: String, example: 'north' })
  land_facing: string;

  @ApiProperty()
  total_floors: number;

  @ApiProperty({ type: String, example: 'north' })
  @IsString()
  gate_side: GateDirection;

  @ApiProperty({ type: String, example: 'north' })
  @IsString()
  staircase_gate: string;

  @ApiProperty({
    type: [String],
    isArray: true,
    default: null,
    nullable: true,
  })
  @IsOptional()
  propertyImages?: string[];

  @ApiProperty({
    type: [String],
    isArray: true,
    required: false,
  })
  @IsOptional()
  additionOptions?: string[];

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  additional_details?: string;
}

export class ColorItemDto {
  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsString()
  color: string;
}

export class InteriorInfoDto {
  @ApiProperty({
    required: false,
    default: null,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  project_scope?: string;

  @ApiProperty({ type: SizeWithUnitDto })
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  total_area:SizeWithUnitDto ;

  @ApiProperty({
    required: false,
    default: null,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  style_preference?: string;

  @ApiProperty({
    type: [ColorItemDto],
    required: false,
    default: null,
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @Type(() => ColorItemDto)
  color_scheme?: ColorItemDto[];

  @ApiProperty({
    default: null,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  totalFloors?: number;

  @ApiProperty({
    required: false,
    default: null,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiProperty({
    required: false,
    default: null,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  special_requirements?: string;

  @ApiProperty({
    isArray: true,
    type: String,
    required: false,
    default: null,
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  reference_images?: string[];

  @ApiProperty({
    isArray: true,
    type: String,
    required: false,
    default: null,
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionOptions?: string[];

  @ApiProperty({
    required: false,
    default: null,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  additional_details?: string;
}

export class ZoningInfoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  zone_type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  fsi_allowed?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  setback_front?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  setback_side?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  setback_rear?: number;
}

export class CommercialConstructionDto {
  @ApiProperty({ enum: CommercialPropertyType })
  @IsEnum(CommercialPropertyType)
  commercial_type: CommercialPropertyType;

  @ApiProperty({ type: SizeWithUnitDto })
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  total_area: SizeWithUnitDto;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  total_floors?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  basement_floors?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  parking_floors?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  land_facing?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  gate_side?: string;

  @ApiProperty({ type: SizeWithUnitDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  length?: SizeWithUnitDto;

  @ApiProperty({ type: SizeWithUnitDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  width?: SizeWithUnitDto;

  @ApiProperty({ type: SizeWithUnitDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  height?: SizeWithUnitDto;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  adjacent_roads?: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  elevator_required?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  number_of_elevators?: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  central_ac_required?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  fire_safety_required?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  parking_required?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  parking_capacity?: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  generator_backup_required?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  generator_capacity_kva?: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  water_treatment_required?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  sewage_treatment_required?: boolean;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  propertyImages?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  additionOptions?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  additional_details?: string;

  @ApiProperty({ type: ZoningInfoDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ZoningInfoDto)
  zoning_info?: ZoningInfoDto;
}

export class CreateCBPropertyDto {
  @ApiProperty()
  @IsString()
  propertyName: string;

  @ApiProperty({
    enum: PurposeType,
    default: PurposeType.Residential,
  })
  @IsEnum(PurposeType)
  construction_type: PurposeType;

  @ApiProperty({
    enum: PropertyType,
    default: PropertyType.Apartment,
    required: false,
  })
  @IsOptional()
  @IsEnum(PropertyType)
  property_type?: PropertyType;

  @ApiProperty({
    enum: CommercialPropertyType,
    required: false,
  })
  @IsOptional()
  @IsEnum(CommercialPropertyType)
  commercial_property_type?: CommercialPropertyType;

  @ApiProperty({
    enum: ConstructionScope,
    default: ConstructionScope.House,
  })
  @IsEnum(ConstructionScope)
  construction_scope: ConstructionScope;

  @ApiProperty()
  @IsOptional()
  @Type(() => HouseConstructionDto)
  houseConstructionInfo?: HouseConstructionDto;

  @ApiProperty({ type: InteriorInfoDto })
  @IsOptional()
  @Type(() => InteriorInfoDto)
  interiorInfo?: InteriorInfoDto;

  @ApiProperty({ type: CommercialConstructionDto })
  @IsOptional()
  @Type(() => CommercialConstructionDto)
  commercialConstructionInfo?: CommercialConstructionDto;
}

export class UpdateCBPropertyDto extends PartialType(CreateCBPropertyDto) {}

export class UpdateFloorsDto {
  @ApiProperty({ type: [CreateFloorDto] })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => CreateFloorDto)
  floors: CreateFloorDto[];
}
