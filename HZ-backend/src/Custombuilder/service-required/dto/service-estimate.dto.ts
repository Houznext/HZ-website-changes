import { IsNumber, IsOptional } from 'class-validator';

export class SingleServiceEstimateDto {
  @IsNumber()
  estimatedDays: number;

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;
}
