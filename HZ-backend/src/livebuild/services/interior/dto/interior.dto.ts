import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
} from 'class-validator';
import { BHKType } from 'src/property/enums/property.enum';

export class RoomFeature {
  @ApiProperty({ example: 'Kitchen' })
  @IsString()
  roomType: string;

  @ApiProperty({ example: 'TV Unit' })
  @IsString()
  featureType: string;

  @ApiProperty({ example: 120, required: false })
  @IsOptional()
  area?: number;

  @ApiProperty({ example: 'BWP Plywood, Laminate finish', required: false })
  @IsOptional()
  @IsString()
  materialDetails?: string;
}

export class CreateInteriorServiceDto {
  @ApiProperty({ enum: BHKType })
  @IsEnum(BHKType)
  @IsOptional()
  bhkType?: string;

  @ApiProperty({
    type: Object,
    example: {
      livingRoom: 1,
      kitchen: 1,
      bedroom: 2,
      bathroom: 2,
      dining: 1,
    },
  })
  @IsOptional()
  rooms?: Record<string, number>;

  @ApiProperty()
  @IsString()
  @IsOptional()
  plywood?: string;

  @ApiProperty({ type: [RoomFeature], required: false })
  @IsOptional()
  @IsArray()
  featureBreakDown?: RoomFeature[];

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  modularKitchen?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  wardrobes?: boolean;

  @ApiProperty({ default: null })
  @IsString()
  @IsOptional()
  cabinetry?: string;

  @ApiProperty({ default: null })
  @IsString()
  @IsOptional()
  furnitureDesign?: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  wallPaneling?: boolean;

  @ApiProperty({ default: null })
  @IsString()
  @IsOptional()
  decorStyle?: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  soundProofing?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  smartHomeFeatures?: boolean;

  @ApiProperty({ default: null })
  @IsString()
  @IsOptional()
  storageSolutions?: string;

  @ApiProperty({ default: null })
  
  @IsOptional()
  additionalRequirements?: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  furnitureLayout?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  ecoFriendlyMaterials?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  childPetFriendly?: boolean;

  @ApiProperty({ default: null, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materialPreferences?: string[];
}

export class UpdateInteriorServiceDto {
  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  modularKitchen?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  wardrobes?: boolean;

  @ApiProperty({
    type: [RoomFeature],
    required: false,
  })
  @IsOptional()
  @IsArray()
  featureBreakDown?: RoomFeature[];

  @ApiProperty({ default: null })
  @IsString()
  @IsOptional()
  cabinetry?: string;

  @ApiProperty({ default: null })
  @IsString()
  @IsOptional()
  furnitureDesign?: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  wallPaneling?: boolean;

  @ApiProperty({ default: null })
  @IsString()
  @IsOptional()
  decorStyle?: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  soundProofing?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  smartHomeFeatures?: boolean;

  @ApiProperty({ default: null })
  @IsString()
  @IsOptional()
  storageSolutions?: string;

  @ApiProperty({ default: null })
  @IsString()
  @IsOptional()
  additionalRequirements?: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  furnitureLayout?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  ecoFriendlyMaterials?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  childPetFriendly?: boolean;

  @ApiProperty({ default: null, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materialPreferences?: string[];
}
