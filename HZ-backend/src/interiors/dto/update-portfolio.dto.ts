import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdatePortfolioDto {
  @IsOptional()
  @IsBoolean()
  isPublishedToPortfolio?: boolean;

  @IsOptional()
  @IsString()
  packageTier?: string;

  @IsOptional()
  @IsNumber()
  deliveredInDays?: number;

  @IsOptional()
  @IsString()
  projectStory?: string;

  @IsOptional()
  @IsString()
  customerTestimonial?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsNumber()
  customerRating?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  portfolioPhotoUrls?: string[];
}
