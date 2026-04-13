import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { QueryStatus } from '../enum/query.enum';

export class CreateQueryDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
 
  customBuilderId: string;
}

export class UpdateQueryDto {
  @ApiProperty()
  @IsOptional()
  @IsEnum(QueryStatus)
  status?: QueryStatus;

  @ApiProperty()
  @IsOptional()
  @IsString()
  adminReply?: string;
}


export class QueryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ enum: QueryStatus })
  status: QueryStatus;

  @ApiProperty()
  customBuilderId: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  adminReply?: string;

  @ApiProperty()
  customBuilderName?: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  userName?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}


