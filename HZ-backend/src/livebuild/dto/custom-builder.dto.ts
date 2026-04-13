import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CurrentStep } from '../enum/custom-builder.enum';

export class CreateCustomBuilderDto {
  @ApiProperty({ enum: CurrentStep, default: CurrentStep.customerOnboarding })
  @IsEnum(CurrentStep)
  currentStep: CurrentStep;

  @ApiProperty()
  @IsString()
  onboardingSteps: number;

  // NEW: branch context and audit
  @ApiProperty({ required: false, description: 'Branch to attach this CB to' })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiProperty({ required: false, description: 'User who creates this CB' })
  @IsOptional()
  @IsString()
  createdByUserId?: string;
  
}

export class UpdateCustomBuilderDto {
  @ApiProperty()
  @IsEnum(CurrentStep)
  @IsOptional()
  currentStep: CurrentStep;

  @ApiProperty()
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  costEstimation?: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  agreement?: string[];

  @ApiProperty()
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  paymentReports?: string[];

  @ApiProperty()
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  weeklyReports?: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  monthlyReports?: string[];

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  estimatedCost?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  estimatedDays?: number;

  @ApiProperty()
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  floorPlans?: string[];
}
