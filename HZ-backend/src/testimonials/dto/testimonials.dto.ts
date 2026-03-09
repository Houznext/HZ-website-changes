import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmpty,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
 IsOptional,
  IsArray
} from 'class-validator';
import { TestimonialCategory } from 'src/Enums/testimonial-category';

export class CreateTestimonialDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty()  
  @IsString()
  userimage?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(TestimonialCategory)
  category: TestimonialCategory;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  location: string;
  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  testimonialImages?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  testimonialVideos?: string[];
}

export class UpdateTestimonialDto {
  @ApiProperty()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsString()
  content?: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty()
  @IsEnum(TestimonialCategory)
  category?: TestimonialCategory;

  @ApiProperty()
  @IsString()
  location?: string;
   @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  testimonialImages?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  testimonialVideos?: string[];
}
