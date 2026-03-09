import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetChatHistoryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ required: false, description: 'Search by content, sender, receiver' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, description: 'From date (YYYY-MM-DD or ISO)' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiProperty({ required: false, description: 'To date (YYYY-MM-DD or ISO)' })
  @IsOptional()
  @IsString()
  to?: string;
}
