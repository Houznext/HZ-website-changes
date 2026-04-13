import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString, IsNumberString, IsObject, IsEnum
} from 'class-validator';
import { DailyProgressStatus } from '../enum/daily-progress.enum';
import { Type } from 'class-transformer';

class MaterialDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  material: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  desc: string;
}

export class CreateDailyProgressDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  day: number;

  @ApiProperty()
  @IsNotEmpty()
  date: Date;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  floor: string[];
  
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  imageOrVideo?: string[];

  @ApiProperty({
    enum: DailyProgressStatus,
    default: DailyProgressStatus.Pending,
  })
  @IsEnum(DailyProgressStatus, {
    message: 'Status must be one of: Pending, InProgress, Completed',
  })
  @IsOptional()
  status?: DailyProgressStatus;

  @ApiProperty()
  @IsString({ each: true })
  @IsOptional()
  workType?: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  placeType: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  issues: string;

  @ApiProperty({ type: [MaterialDto] })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => MaterialDto)
  materials: MaterialDto[];

  @ApiProperty()
  @IsNumber()
  laborCount: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  expensesIncurred: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  customerNotes: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  roomType?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  featureType?: string;
  @ApiProperty()
  @IsString()
  uploadedById: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  uploadedByName?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  phaseId?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  uploadedByProfile?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false, description: 'Latitude as string (matches decimal DB type)' })
  @IsOptional()
  @IsNumberString()
  latitude?: string;

  @ApiProperty({ required: false, description: 'Longitude as string (matches decimal DB type)' })
  @IsOptional()
  @IsNumberString()
  longitude?: string;

  @ApiProperty({
    required: false,
    type: 'object',
    example: { locality: 'Madhapur', subLocality: 'Image Gardens', place_id: 'abcd', accuracyMeters: 25 },
  })
  @IsOptional()
  @IsObject()
  uploadLocation?: Record<string, any>;

}

export class UpdateDailyProgressDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  day?: number;
  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  floor: string[];

  @ApiProperty()
  @IsOptional()
  date?: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  imageOrVideo?: string[];

  @ApiProperty({
    enum: DailyProgressStatus,
    default: DailyProgressStatus.Pending,
  })
  @IsOptional()
  status?: DailyProgressStatus;

  @ApiProperty()
  @IsString({ each: true })
  @IsOptional()
  workType?: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  placeType?: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  issues?: string;

  @ApiProperty({ type: [MaterialDto] })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => MaterialDto)
  materials: MaterialDto[];

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  laborCount?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  expensesIncurred?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  customerNotes?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  roomType?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  featureType?: string;
  @ApiProperty()
  @IsString()
  uploadedById: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  uploadedByName?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  phaseId?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  uploadedByProfile?: string;


  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  latitude?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  longitude?: string;

  @ApiProperty({ required: false, type: 'object' })
  @IsOptional()
  @IsObject()
  uploadLocation?: Record<string, any>;
}
