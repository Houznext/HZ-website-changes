import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  IsNumber,
} from 'class-validator';
import { BrickTypes, RailingMaterials } from '../enum/brickMasonry.enum';
import { CementBrands } from '../../centring/enum/centring.enum';

export class CreateBrickMasonryDto {
  @ApiProperty()
  @IsString()
  typeOfWork: string;

  @ApiProperty({ enum: BrickTypes })
  @IsEnum(BrickTypes)
  brickType: BrickTypes;

  @ApiProperty()
  @IsString()
  brickQuality: string;

  @ApiProperty({ enum: CementBrands })
  @IsEnum(CementBrands)
  cementBrand: CementBrands;

  @ApiProperty()
  @IsString()
  cementType: string;

  @ApiProperty()
  @IsBoolean()
  plasteringRequired: boolean;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  plasteringType: string[];

  @ApiProperty()
  @IsBoolean()
  basementRequired: boolean;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  basementArea: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  basementHeight: number;

  @ApiProperty({ enum: RailingMaterials })
  @IsEnum(RailingMaterials)
  railingMaterial: RailingMaterials;

  @ApiProperty()
  @IsString()
  railingType: string;

  @ApiProperty()
  @IsNumber()
  totalArea: number;

  @ApiProperty()
  @IsString()
  structureType: string;

  @ApiProperty()
  @IsString()
  elevationDetails: string;

  @ApiProperty({ required: false })
  @IsOptional()
  
  additionalRequirement?: string;
}

export class UpdateBrickMasonryDto extends PartialType(CreateBrickMasonryDto) {}
