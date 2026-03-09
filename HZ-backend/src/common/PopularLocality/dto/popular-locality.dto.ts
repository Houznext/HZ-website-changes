import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreatePopularLocalityDto {
  @ApiProperty({ example: 'Hitech City' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Hyderabad' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Madhapur', required: false })
  @IsOptional()
  @IsString()
  zone?: string;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePopularLocalityDto extends CreatePopularLocalityDto {}
