import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStateDto {
  @ApiProperty({ example: 'Telangana' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'India', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string = 'India';
}

export class UpdateStateDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;
}

export class ReturnStateDto {
  id: number;
  name: string;
  country: string;
}
