import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  state?: string;

  @ApiProperty()
  @IsString()
  locality: string;

  @ApiProperty()
  @IsString()
  zipCode: string;

  @ApiProperty()
  @IsString()
  address_line_1: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  address_line_2?: string;
}

export class UpdateLocationDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  locality?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  address_line_1?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  address_line_2?: string;
}
