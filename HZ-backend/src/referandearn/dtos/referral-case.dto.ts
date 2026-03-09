import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  IsEmail,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  ReferralCaseStatus,
  ReferralCategory,
} from '../enum/refer-and-earn.enum';

export class CreateReferralCaseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({ description: 'User ID of the person who referred (linked to this referral)' })
  @Transform(({ value }) => (value != null ? String(value) : value))
  @IsString()
  @IsNotEmpty({ message: 'referrerUserId is required to link who referred' })
  referrerUserId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  leadName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Phone number must be a valid 10-digit Indian number',
  })
  leadPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  leadEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  leadCity?: string;

  @ApiPropertyOptional({
    example: 'Looking for 2BHK near metro',
    description: 'Additional requirement notes',
  })
  @IsOptional()
  @IsString()
  requirementNote?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  relationshipType: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  category?: ReferralCategory;
}

export class UpdateReferralCaseByUserDto extends CreateReferralCaseDto {}

export class UpdateReferralCaseStepDto {
  @ApiProperty({
    example: 12,
    description: 'Admin user ID updating the referral',
  })
  @IsString()
  adminUserId: string;

  @ApiProperty({
    example: 2,
    description: 'Progress step (1 to 5)',
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  toStep: number;

  @ApiPropertyOptional({
    example: 18,
    description: 'Assign referral to internal sales user',
  })
  @IsOptional()
  @IsNumber()
  assignedToUserId?: number;

  @ApiPropertyOptional({
    example: 'Site visit scheduled for Saturday',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    enum: ReferralCaseStatus,
    example: ReferralCaseStatus.OPEN,
  })
  @IsOptional()
  @IsEnum(ReferralCaseStatus)
  status?: ReferralCaseStatus;

  @ApiProperty()
  @IsString()
  @IsOptional()
  relationshipType: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  category?: ReferralCategory;
}

export class ReferralCaseResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  propertyId: string;

  @ApiProperty()
  propertyTitle: string;

  @ApiProperty()
  propertyCity: string;

  @ApiProperty()
  leadName: string;

  @ApiProperty()
  leadPhone: string;

  @ApiProperty()
  currentStep: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional({})
  referralCode: string;
}

export class ListReferralCasesDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  /** Filters */

  @ApiPropertyOptional({
    example: 45,
    description: 'Filter by referrer user ID',
  })
  @IsOptional()
  @IsString()
  referrerUserId?: string;

  @ApiPropertyOptional({
    example: 123,
    description: 'Filter by property ID',
  })
  @IsOptional()
  // @Type(() => Number)
  // @IsNumber()
  propertyId?: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'Filter by current progress step (1–5)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  step?: number;

  @ApiPropertyOptional({
    enum: ReferralCaseStatus,
    description: 'Filter by referral case status',
  })
  @IsOptional()
  @IsEnum(ReferralCaseStatus)
  status?: ReferralCaseStatus;

  @ApiPropertyOptional({})
  @IsOptional()
  @IsString()
  referralCode: string;
}
