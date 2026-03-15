import { IsString, IsOptional, IsIn, IsDateString } from 'class-validator';

export class AddMediaDto {
  @IsOptional()
  @IsString()
  dailyUpdateId?: string;

  @IsString()
  s3Url: string;

  @IsOptional()
  @IsIn(['photo', 'video', 'document'])
  mediaType?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsString()
  uploadedBy: string;

  @IsOptional()
  @IsString()
  tradeTag?: string;

  @IsOptional()
  @IsString()
  stageTag?: string;

  @IsOptional()
  @IsDateString()
  takenAt?: string;

  @IsString()
  tradeId: string;
}
