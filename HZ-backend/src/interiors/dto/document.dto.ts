import { IsString, IsOptional, IsInt, IsDateString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class AddDocumentDto {
  @IsIn(['design', 'floor_plan', 'quotation', 'invoice', 'warranty', 'report', 'other'])
  category: string;

  @IsString()
  documentName: string;

  @IsString()
  s3Url: string;

  @IsString()
  uploadedBy: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  fileSize?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsString()
  projectId: string;
}
