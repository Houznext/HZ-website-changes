import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import {
  FixtureBrands,
  PipeBrands,
  PipeMaterials,
} from '../enum/plumbing.enum';

export class CreatePlumbingDto {
  @ApiProperty()
  @IsString()
  typeOfWork: string;

  @ApiProperty({ enum: PipeMaterials, default: PipeMaterials.CPVC })
  @IsEnum(PipeMaterials)
  pipeMaterial: PipeMaterials;

  @ApiProperty({ enum: PipeBrands, default: PipeBrands.Finolex })
  @IsEnum(PipeBrands)
  pipeBrand: PipeBrands;

  @ApiProperty({ enum: FixtureBrands, default: FixtureBrands.Jaquar })
  @IsEnum(FixtureBrands)
  fixtureBrand: FixtureBrands;

  @ApiProperty()
  @IsInt()
  totalBathrooms: number;

  @ApiProperty()
  @IsInt()
  totalKitchens: number;

  @ApiProperty()
  @IsString()
  waterSource: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  indianBathrooms: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  westernBathrooms: number | null;

  @ApiProperty()
  @IsInt()
  pipeThickness: number;

  @ApiProperty()
  @IsString()
  additionalRequirement: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  isDrainageRequired: boolean;
}

export class UpdatePlumbingDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  typeOfWork?: string;

  @ApiProperty({ enum: PipeMaterials, required: false })
  @IsOptional()
  @IsEnum(PipeMaterials)
  pipeMaterial?: PipeMaterials;

  @ApiProperty({ enum: PipeBrands, required: false })
  @IsOptional()
  @IsEnum(PipeBrands)
  pipeBrand?: PipeBrands;

  @ApiProperty({ enum: FixtureBrands, required: false })
  @IsOptional()
  @IsEnum(FixtureBrands)
  fixtureBrand?: FixtureBrands;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  totalBathrooms?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  totalKitchens?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  waterSource?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  indianBathrooms?: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  westernBathrooms?: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  pipeThickness?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  
  additionalRequirement?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDrainageRequired?: boolean;
}
