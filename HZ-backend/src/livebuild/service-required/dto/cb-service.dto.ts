import {
  IsEnum,
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { ServiceType } from '../enum/cb-service.enum';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SingleServiceEstimateDto } from './service-estimate.dto';

class CBPackageDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  packageSelected: any | null;
}

export class CreateCBServiceDto {
  @ApiProperty({ enum: ServiceType })
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  selectedServices?: string[];

  @ApiProperty({ type: CBPackageDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CBPackageDto)
  package?: CBPackageDto;
  
  @IsOptional()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => SingleServiceEstimateDto)
  serviceEstimates?: Record<string, SingleServiceEstimateDto>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  commercialServiceDetails?: Record<string, any>;
}

export class UpdateCBServiceDto extends PartialType(CreateCBServiceDto) {}
