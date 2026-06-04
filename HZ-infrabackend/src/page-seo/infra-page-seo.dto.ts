import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpsertInfraPageSeoDto {
  @ApiProperty({ example: '/' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  path: string;

  @ApiProperty({ example: 'Homepage (/)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  label: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  metaTitle: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  metaDescription: string;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @IsOptional()
  ogImageUrl?: string | null;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  hasStructuredData?: boolean;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  noIndex?: boolean;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(512)
  keywords?: string | null;
}
