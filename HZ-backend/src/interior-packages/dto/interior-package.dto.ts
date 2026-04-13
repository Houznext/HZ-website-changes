import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

const BHK_VALUES = ['2bhk', '3bhk'] as const;

export class CreateInteriorPackageDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(50)
  price: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  suffix?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsBoolean()
  highlighted?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined && v !== '')
  @IsIn(BHK_VALUES)
  bhkType?: string | null;
}

export class UpdateInteriorPackageDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  price?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  suffix?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsBoolean()
  highlighted?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined && v !== '')
  @IsIn(BHK_VALUES)
  bhkType?: string | null;
}
