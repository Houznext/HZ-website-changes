import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class UpdateServiceContentDto {
  @IsOptional() @IsString() cardTitle?: string;
  @IsOptional() @IsString() cardDescription?: string;
  @IsOptional() @IsString() cardImageUrl?: string;
  @IsOptional() @IsString() cardBadge?: string;
  @IsOptional() @IsString() heroHeadline?: string;
  @IsOptional() @IsString() heroSubheading?: string;
  @IsOptional() @IsString() heroImageUrl?: string;
  @IsOptional() @IsString() heroEyebrow?: string;
  @IsOptional() @IsString() heroCta?: string;
  @IsOptional() @IsNumber() sortOrder?: number;
  @IsOptional() @IsBoolean() active?: boolean;
}
