import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchPropertyDto {
  @IsString()
  @MinLength(2)
  q: string;

  /** Hero tab hint — boosts matching type, does not exclude other types. */
  @IsOptional()
  @IsString()
  hintType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
