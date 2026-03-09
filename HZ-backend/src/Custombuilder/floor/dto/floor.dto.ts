import {
  IsNumber,
  IsArray,
  ArrayNotEmpty,
  IsString,
  IsBoolean,
  isArray,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

class PortionDetailsDto {
  @ApiProperty()
  @IsString()
  portionType: string;

  @ApiProperty()
  @IsNumber()
  bedrooms: number;

  @ApiProperty()
  @IsNumber()
  bathrooms: number;

  @ApiProperty()
  @IsNumber()
  balconies: number;

  @ApiProperty()
  @IsBoolean()
  indian_bathroom_required: boolean;

  @ApiProperty()
  @IsArray({ each: true  })
  additional_rooms: string[];
}

export class CreateFloorDto {
  @ApiProperty()
  @IsNumber()
  floor: number;

  @ApiProperty()
  @IsNumber()
  portions: number;

  @ApiProperty()
  @IsArray()
  ground_floor_details: string[];

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  type_of_portions: string[];

  @ApiProperty({ type: [PortionDetailsDto] })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => PortionDetailsDto)
  portionDetails: PortionDetailsDto[];
}

export class UpdateFloorDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  floor?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  portions?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  ground_floor_details?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  type_of_portions?: string[];

  @ApiProperty({ required: false, type: [PortionDetailsDto] })
  @IsOptional()
  @IsArray()
  @Type(() => PortionDetailsDto)
  portionDetails?: PortionDetailsDto[];
}
