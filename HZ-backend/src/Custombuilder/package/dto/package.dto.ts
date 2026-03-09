import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray, ArrayNotEmpty, IsInt, Min, IsOptional, IsString, MaxLength, ValidateNested, IsEnum, IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ConstructionScope } from 'src/Custombuilder/custom-property/enum/custom-property.enum';

class FeatureItemDto {
  @ApiProperty({ example: 'Kitchen' })
  @IsString()
  @MaxLength(120)
  title: string;

  @ApiProperty({ example: ['Granite platform', 'Stainless steel sink'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  points: string[];
}

export class CreatePackageDto {
  @ApiProperty({ example: 'Essentials' })
  @IsString()
  @MaxLength(160)
  name: string;

  @ApiProperty({ example: 1499 })
  @IsInt()
  @Min(0)
  ratePerSqft: number;

  @ApiProperty({ type: [FeatureItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => FeatureItemDto)
  features: FeatureItemDto[];

  @ApiProperty({ example: 2, description: 'Branch ID' })
  @IsString()
  branchId: string;

  @ApiProperty({ enum: ConstructionScope, required: false })
  @IsOptional()
  @IsEnum(ConstructionScope)
  construction_scope?: ConstructionScope;
}

export class UpdatePackageDto extends PartialType(CreatePackageDto) {
  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsString()
  branchId?: string;
}
