import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CentringMaterials,
  CementBrands,
  SteelBrands,
} from '../enum/centring.enum';

export class CreateCentringDto {
  @ApiProperty({ enum: CentringMaterials })
  @IsEnum(CentringMaterials)
  centringMaterial: CentringMaterials;

  @ApiProperty()
  @IsInt()
  totalArea: number;

  @ApiProperty({ enum: SteelBrands })
  @IsEnum(SteelBrands)
  steelBrand: SteelBrands;

  @ApiProperty()
  @IsString()
  additionalRequirement: string;

  @ApiProperty()
  @IsBoolean()
  isScaffoldingRequired: boolean;

  @ApiProperty({ enum: CementBrands })
  @IsEnum(CementBrands)
  cementBrand: CementBrands;
}

export class UpdateCentringDto {
  @ApiPropertyOptional({ enum: CentringMaterials })
  @IsOptional()
  @IsEnum(CentringMaterials)
  centringMaterial?: CentringMaterials;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  totalArea?: number;

  @ApiPropertyOptional({ enum: SteelBrands })
  @IsOptional()
  @IsEnum(SteelBrands)
  steelBrand?: SteelBrands;

  @ApiPropertyOptional()
  @IsOptional()
  
  additionalRequirement?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isScaffoldingRequired?: boolean;

  @ApiPropertyOptional({ enum: CementBrands })
  @IsOptional()
  @IsEnum(CementBrands)
  cementBrand?: CementBrands;
}
