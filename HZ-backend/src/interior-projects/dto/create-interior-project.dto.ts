import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsIn,
} from 'class-validator';

export class CreateInteriorProjectDto {
  @IsString()
  title: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @IsNumber()
  sqft?: number;

  @IsOptional()
  @IsString()
  package?: string;

  @IsOptional()
  @IsNumber()
  costInLakhs?: number;

  @IsOptional()
  @IsNumber()
  deliveryDays?: number;

  @IsOptional()
  @IsString()
  style?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  rooms?: string[];

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  @IsIn(['Draft', 'Live', 'Hidden'])
  status?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
