import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsBoolean,
  IsString,
  IsOptional,
  IsNumber,
} from 'class-validator';
import {
  FlooringMaterials,
  FinishTypes,
  InstallationTypes,
} from '../enum/flooring.enum';

export class CreateFlooringDto {
  @ApiProperty({ enum: FlooringMaterials, default: FlooringMaterials.Tiles })
  @IsEnum(FlooringMaterials)
  flooringMaterial: FlooringMaterials;

  @ApiProperty()
  @IsInt()
  totalArea: number;

  @ApiProperty({ enum: FinishTypes, default: FinishTypes.Matte })
  @IsEnum(FinishTypes)
  finishType: FinishTypes;

  @ApiProperty()
  @IsNumber()
  materialThickness: number;

  @ApiProperty({ enum: InstallationTypes, default: InstallationTypes.Direct })
  @IsEnum(InstallationTypes)
  installationType: InstallationTypes;

  @ApiProperty({ default: false })
  @IsBoolean()
  isSkirtingRequired: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  additionalRequirement?: string;
}

export class UpdateFlooringDto {
  @ApiProperty({ enum: FlooringMaterials, default: FlooringMaterials.Tiles })
  @IsEnum(FlooringMaterials)
  @IsOptional()
  flooringMaterial?: FlooringMaterials;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  totalArea?: number;

  @ApiProperty({ enum: FinishTypes, default: FinishTypes.Matte })
  @IsEnum(FinishTypes)
  @IsOptional()
  finishType?: FinishTypes;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  materialThickness?: number;

  @ApiProperty({ enum: InstallationTypes, default: InstallationTypes.Direct })
  @IsEnum(InstallationTypes)
  @IsOptional()
  installationType?: InstallationTypes;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  isSkirtingRequired?: boolean;

  @ApiProperty()
  
  @IsOptional()
  additionalRequirement?: string;
}
