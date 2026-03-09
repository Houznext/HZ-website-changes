import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCityDto {
  @ApiProperty({ example: 'Hyderabad' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  stateId: number;
}

export class UpdateCityDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  stateId?: number;
}

export class ListCitiesQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  stateId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  q?: string;
}

export class ReturnCityDto {
  id: number;
  name: string;
}
