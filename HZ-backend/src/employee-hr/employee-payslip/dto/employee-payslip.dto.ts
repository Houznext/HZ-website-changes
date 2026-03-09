
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PayslipStatus } from '../entity/employee-payslip.entity';

export class CreatePayslipDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  month: number;

  @Type(() => Number)
  @IsInt()
  year: number;

  @Type(() => Number)
  @IsNumber()
  grossEarnings: number;

  @Type(() => Number)
  @IsNumber()
  totalDeductions: number;

  @Type(() => Number)
  @IsNumber()
  netPay: number;

  @IsDateString()
  payDate: string;

  @IsOptional()
  @IsString()
  payslipNumber?: string;

  @IsOptional()
  @IsString()
  pdfUrl?: string;
}

export class UpdatePayslipDto {
  @IsOptional()
  @IsEnum(PayslipStatus)
  status?: PayslipStatus;

  @IsOptional()
  @IsString()
  pdfUrl?: string;
}

export class ListPayslipsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsOptional()
  @IsEnum(PayslipStatus)
  status?: PayslipStatus;
}
