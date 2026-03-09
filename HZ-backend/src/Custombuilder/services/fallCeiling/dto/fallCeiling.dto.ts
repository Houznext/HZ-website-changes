import {
  IsEnum,
  IsInt,
  IsString,
  IsArray,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { PartialType } from '@nestjs/mapped-types';
import {
  CeilingMaterials,
  CeilingDesigns,
  FinishOptions,
  RoomTypes,
} from '../enum/fallCeiling.enum';

export class CreateFallCeilingDto {
  @ApiProperty()
  @IsInt()
  numberOfRooms: number;

  @ApiProperty({ enum: CeilingMaterials })
  @IsEnum(CeilingMaterials)
  ceilingMaterial: CeilingMaterials;

  @ApiProperty({ enum: CeilingDesigns })
  @IsEnum(CeilingDesigns)
  ceilingDesign: CeilingDesigns;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  lightingOptions: string[];

  @ApiProperty({ enum: FinishOptions })
  @IsEnum(FinishOptions)
  ceilingFinish: FinishOptions;

  @ApiProperty({ enum: RoomTypes })
  @IsEnum(RoomTypes)
  roomType: RoomTypes;

  @ApiProperty()
  @IsInt()
  totalArea: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  additionalRequirement: string;
}

export class UpdateFallCeilingDto {
  @ApiProperty()
  @IsOptional()
  @IsInt()
  numberOfRooms?: number;

  @ApiProperty({ enum: CeilingMaterials })
  @IsOptional()
  @IsEnum(CeilingMaterials)
  ceilingMaterial?: CeilingMaterials;

  @ApiProperty({ enum: CeilingDesigns })
  @IsOptional()
  @IsEnum(CeilingDesigns)
  ceilingDesign?: CeilingDesigns;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lightingOptions?: string[];

  @ApiProperty({ enum: FinishOptions })
  @IsOptional()
  @IsEnum(FinishOptions)
  ceilingFinish?: FinishOptions;

  @ApiProperty({ enum: RoomTypes })
  @IsOptional()
  @IsEnum(RoomTypes)
  roomType?: RoomTypes;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  totalArea?: number;

  @ApiProperty()
  @IsOptional()
 
 
  additionalRequirement?: string;
}
