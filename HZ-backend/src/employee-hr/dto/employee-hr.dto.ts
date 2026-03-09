// src/hr/dto/base-hr-details.dto.ts
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  IsInt,
} from 'class-validator';

import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  INTERN = 'INTERN',
  CONTRACTOR = 'CONTRACTOR',
}


export class BaseHrDetailsDto {
  @ApiProperty({ description: 'User ID' })
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @IsOptional()
  @IsDateString()
  joiningDate?: string;

  @IsOptional()
  @IsDateString()
  relievingDate?: string;

  @IsOptional()
  branchId?: string;


  @IsOptional()
  @Length(12, 12)
  aadhaarNumber?: string;

  @IsOptional()
  @Length(10, 10)
  panNumber?: string;


  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  accountHolderName?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  ifscCode?: string;

  @IsOptional()
  @IsString()
  upiId?: string;

  @IsOptional()
  @IsNumber()
  baseSalary?: number;

  @IsOptional()
  @IsString()
  salaryCurrency?: string;


  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsPhoneNumber('IN')
  emergencyContactPhone?: string;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  casualLeaveBalance?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sickLeaveBalance?: number;
}
export class CreateHrDetailsDto extends BaseHrDetailsDto { }
export class UpdateHrDetailsDto extends PartialType(BaseHrDetailsDto) { }
export class ListHrDetailsQueryDto {
  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @IsOptional()
  @IsString()
  search?: string;
}