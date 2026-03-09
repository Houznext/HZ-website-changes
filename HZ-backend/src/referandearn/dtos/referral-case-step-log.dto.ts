import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateReferralCaseStepLogDto {
  @ApiProperty()
  @IsNumber()
  referralCaseId: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  fromStep: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  toStep: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  updatedByUserId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class ListReferralCaseStepLogsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  referralCaseId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  updatedByUserId?: number;
}

export class ReferralCaseStepLogResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  referralCaseId: number;

  @ApiProperty()
  fromStep: number;

  @ApiProperty()
  toStep: number;

  @ApiProperty()
  note?: string;

  @ApiProperty()
  updatedByUserId?: number;

  @ApiProperty()
  updatedByName?: string;

  @ApiProperty()
  createdAt: Date;
}
