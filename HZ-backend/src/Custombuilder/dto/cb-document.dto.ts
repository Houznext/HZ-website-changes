import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsDateString,
  IsNumber,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { CBDocumentType, BillCategory } from '../enum/custom-builder.enum';

export class BillMetaDto {
  @IsOptional()
  @IsEnum(BillCategory)
  category?: BillCategory;

  @IsOptional()
  @IsNumber()
  amount?: number; 

  @IsOptional()
  @IsString()
  @MaxLength(120)
  vendor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  referenceNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  paidVia?: 'cash' | 'upi' | 'card' | 'bank' | 'cheque' | 'other';

  @IsOptional()
  @IsString()
  @MaxLength(20)
  gstNo?: string;
}
export class CreateCBDocumentDto {
  @IsNotEmpty()
  @IsEnum(CBDocumentType)
  type: CBDocumentType;

  @IsNotEmpty()
  @IsUrl()
  fileUrl: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  documentDate?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => BillMetaDto)
  meta?: BillMetaDto;

  
  @IsOptional()
  @IsNumber()
  phaseId?: number;

  @IsOptional()
  @IsNumber()
  dayLogId?: number;


  @IsOptional()
  @IsString()
  uploadedById?: string;
}

export class UpdateCBDocumentDto extends PartialType(CreateCBDocumentDto) {}

export class ReturnCBDocumentDto {
  id: number;
  type: CBDocumentType;
  fileUrl: string;
  title?: string;
  notes?: string;
  documentDate?: string;
  meta?: BillMetaDto;
  
  createdAt: Date;
  updatedAt: Date;
  uploadedBy?: number;
}
