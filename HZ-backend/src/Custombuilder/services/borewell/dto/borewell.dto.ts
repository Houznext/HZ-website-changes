import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDecimal,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  CasingOptions,
  CasingType,
  DrillingTechnology,
  PumsetCompany,
} from '../enum/borewell.enum';

export class CreateBorewellDto {
  @ApiProperty()
  @IsInt()
  recommendedDepth: number;

  @ApiProperty()
  @IsNumber()
  borewellDiameter: number;

  @ApiProperty()
  @IsBoolean()
  hydroSurvey: boolean;

  @ApiProperty({ enum: CasingType, default: CasingType.Steel })
  @IsEnum(CasingType)
  casingType: CasingType;

  @ApiProperty({
    enum: DrillingTechnology,
    default: DrillingTechnology.Percussion,
  })
  @IsEnum(DrillingTechnology)
  drillingType: DrillingTechnology;

  @ApiProperty({ enum: CasingOptions, default: CasingOptions.Deep })
  @IsEnum(CasingOptions)
  casingDepth: CasingOptions;

  @ApiProperty({ enum: PumsetCompany, default: PumsetCompany.Kirloskar })
  @IsEnum(PumsetCompany)
  pumpBrand: PumsetCompany;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  additionalRequirement?: string;
}

export class UpdateBorewellDto {
  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  recommendedDepth?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  borewellDiameter?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  hydroSurvey?: boolean;

  @ApiProperty({
    enum: CasingType,
    required: false,
  })
  @IsEnum(CasingType)
  @IsOptional()
  casingType?: CasingType;

  @ApiProperty({
    enum: DrillingTechnology,
    required: false,
  })
  @IsEnum(DrillingTechnology)
  @IsOptional()
  drillingType?: DrillingTechnology;

  @ApiProperty({
    enum: CasingOptions,
    required: false,
  })
  @IsEnum(CasingOptions)
  @IsOptional()
  casingDepth?: CasingOptions;

  @ApiProperty({
    enum: PumsetCompany,
    required: false,
  })
  @IsEnum(PumsetCompany)
  @IsOptional()
  pumpBrand?: PumsetCompany;

  @ApiProperty({ required: false })
 
  @IsOptional()
  additionalRequirement?: string;
}
