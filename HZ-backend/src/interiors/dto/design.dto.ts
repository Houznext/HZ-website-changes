import { IsString, IsOptional, IsIn } from 'class-validator';

export class AddDesignDto {
  @IsString()
  roomTag: string;

  @IsString()
  s3Url: string;

  @IsOptional()
  @IsIn(['sample', 'full'])
  designType?: string;

  @IsOptional()
  @IsString()
  designNotes?: string;

  @IsString()
  uploadedBy: string;

  @IsOptional()
  version?: number;

  @IsString()
  projectId: string;
}
