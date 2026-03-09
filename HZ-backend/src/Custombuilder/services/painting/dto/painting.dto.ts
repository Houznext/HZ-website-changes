import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaintBrands } from '../enum/painting.enum';

export class CreatePaintingDto {
  @ApiProperty()
  @IsString()
  typeOfWork: string;

  @ApiProperty()
  @IsString()
  paintType: string;

  @ApiProperty({ enum: PaintBrands, default: PaintBrands.ASIAN_PAINTS })
  @IsEnum(PaintBrands)
  paintBrand: PaintBrands;

  @ApiProperty()
  @IsInt()
  totalArea: number;

  @ApiProperty()
  @IsInt()
  numberOfCoats: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  surfacePreparation: string[];

  @ApiProperty()
  @IsInt()
  roomCount: number;

  @ApiProperty()
  @IsString()
  surfaceType: string;

  @ApiProperty()
  @IsString()
  finishType: string;

  @ApiProperty({ required: false })
  @IsOptional()
 
  additionalRequirement?: string;
}

export class UpdatePaintingDto extends PartialType(CreatePaintingDto) {}
