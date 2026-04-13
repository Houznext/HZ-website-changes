
import { IsEnum, IsOptional, IsString, IsArray,IsNumber } from 'class-validator';
import { MaterialCategoryEnum, MaterialUnitEnum } from '../enums/materials.enum';
import { ApiProperty } from '@nestjs/swagger';


export class CreateMaterialDto {
    @ApiProperty()
  @IsString()
  name: string;

  @IsEnum(MaterialCategoryEnum)
  @ApiProperty()

  category: MaterialCategoryEnum;

  @IsEnum(MaterialUnitEnum)
  @ApiProperty()
  unit: MaterialUnitEnum;

  @IsOptional()
  @IsString()
  @ApiProperty()
  notes?: string;

  @IsOptional()
  @ApiProperty()
  @IsArray()
  images?: string[];
  @IsOptional()
  @IsNumber()
  @ApiProperty()
  quantity?: number;
}

export class UpdateMaterialDto extends CreateMaterialDto {}
