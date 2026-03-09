import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { Blog, } from '../entities/blog.entity';
import { User } from 'src/user/entities/user.entity';
import { BlogStatus, BlogType } from 'src/Enums/Blogs/blog';
import { Transform } from 'class-transformer';

export class CreateBlogDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  title: string;

  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value.trim())
  previewDescription?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  thumbnailImageUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  CoverImageUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  externalResourceLink?: string;

  @ApiProperty()
  @IsNotEmpty()
  blogType: BlogType;

  @ApiProperty()
  @IsNotEmpty()
  blogStatus: BlogStatus;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdateBlogDto {
  @ApiProperty({ required: true })
  @IsString()
  id: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  previewDescription?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  thumbnailImageUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  CoverImageUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  externalResourceLink?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  blogType: BlogType;

  @ApiProperty({ required: false })
  @IsOptional()
  blogStatus: BlogStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  content?: string;
}

export class GetAllBlogDto {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  includeCreatedUser?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  includeUpdatedUser?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  blogType?: BlogType | Array<BlogType>;

  @ApiProperty({ required: false })
  @IsOptional()
  blogStatus?: BlogStatus | Array<BlogStatus>;

  @ApiProperty({ required: false, enum: ['createdAt', 'updatedAt', 'title'], default: 'createdAt' })
  @IsString()
  @IsOptional()
  sortBy?: 'createdAt' | 'updatedAt' | 'title';

  @ApiProperty({ required: false, enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';

  @ApiProperty({ required: false, description: 'Number of records to skip for pagination' })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  skip?: number;

  @ApiProperty({ required: false, description: 'Number of records to take for pagination' })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  take?: number;
}

export class GetByIdBlogDto {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  includeCreatedUser?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  includeUpdatedUser?: boolean;
}

export class blogGetByIdDto {
  id: number;
  title: string;
  CoverImageUrl: string;
  externalResourceLink: string;
  previewDescription?: string;
  thumbnailImageUrl?: string;
  blogType: BlogType;
  blogStatus: BlogStatus;
  content: string;
  updatedAt: Date;
  createdAt: Date;
}

export class blogGetAllDto {
  id: number;
  title: string;
  previewDescription?: string;
  thumbnailImageUrl?: string;
  blogType: BlogType;
  blogStatus: BlogStatus;
  updatedAt: Date;
  createdAt: Date;
}

export class createUpdateBlog {
  id: number;
  title: string;
}

export class deleteBlog {
  id: number;
}
