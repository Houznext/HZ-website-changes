
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LeaveStatus, LeaveType } from '../entity/employee-leave.entity';

export class ApplyLeaveDto {
  @IsEnum(LeaveType)
  type: LeaveType;

  @IsDateString()
  fromDate: string;

  @IsDateString()
  toDate: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  days: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateLeaveStatusDto {
  @IsEnum(LeaveStatus)
  status: LeaveStatus;

  @IsOptional()
  @IsString()
  remark?: string; // we don't store this now, but you can extend entity
}

export class ListLeavesQueryDto {
  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;

  @IsOptional()
  @IsEnum(LeaveType)
  type?: LeaveType;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}
