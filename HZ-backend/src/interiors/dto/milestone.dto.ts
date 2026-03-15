import { IsString, IsOptional, IsNumber, IsDateString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMilestoneDto {
  @IsOptional()
  @IsString()
  milestoneName?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  amount?: number;

  @IsOptional()
  @IsString()
  triggerCondition?: string;

  @IsOptional()
  @IsIn(['pending', 'requested', 'paid'])
  status?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sortOrder?: number;
}
