import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BrokerageModel,
  ReferAndEarnStatus,
} from '../enum/refer-and-earn.enum';

import {
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsString,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';


export class CreateReferralAgreementDto {
  @ApiProperty()
   @IsString()
  propertyId: string;

  @ApiProperty({ enum: BrokerageModel, example: BrokerageModel.PERCENTAGE })
   @IsEnum(BrokerageModel)
  brokerageModel: BrokerageModel;

  @ApiPropertyOptional()
   @IsOptional()
  @IsNumber()
  brokerageValue?: number;
  @ApiPropertyOptional()
   @IsOptional()
  @IsNumber()
  referrerValue?: number;

  @ApiPropertyOptional({ example: 50000 })
   @IsOptional()
  @IsNumber()
  minBrokerageAmount?: number;

  @ApiPropertyOptional({ example: 65, description: 'Referrer share percent' })
   @IsOptional()
  @IsNumber()
  referrerSharePercent?: number;

  @ApiPropertyOptional({
    example: 130000,
    description: 'Max wallet credits cap',
  })
   @IsOptional()
  @IsNumber()
  referrerMaxCredits?: number;

  @ApiPropertyOptional({ example: true })
   @IsOptional()
  @IsBoolean()
  hideOwnerContactFromPublic?: boolean;

  @ApiPropertyOptional({ example: '2025-01-01T00:00:00.000Z' })
   @IsOptional()
  @IsDateString()
  effectiveFrom?: Date;

  @ApiPropertyOptional({ example: '2025-12-31T00:00:00.000Z' })
   @IsOptional()
  @IsDateString()
  effectiveTo?: Date;

  @ApiPropertyOptional({ example: 'Owner agreed for refer & earn model.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 15, description: 'Admin user id' })
  @IsOptional()
  
  approvedByUserId?: string;
}

export class UpdateReferralAgreementDto extends CreateReferralAgreementDto {}

export class UpdateAgreementStatusDto {
  @ApiProperty({ enum: ReferAndEarnStatus, example: ReferAndEarnStatus.ACTIVE })
   @IsEnum(ReferAndEarnStatus)
  status: ReferAndEarnStatus;

  @ApiProperty()
   @IsString()
  adminUserId: string;

  @ApiPropertyOptional()
   @IsOptional()
  @IsString()
  notes?: string;
}

export class ListReferAndEarnPropertiesDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  @ApiPropertyOptional({ enum: ReferAndEarnStatus, required: false })
  @IsOptional()
  @IsEnum(ReferAndEarnStatus)
  status?: ReferAndEarnStatus;

  @ApiPropertyOptional({ example: 'Hyderabad' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Kondapur' })
  @IsOptional()
  @IsString()
  locality?: string;
}

export class CreateReferralLeadDto {
  @ApiProperty()
  propertyId: number;

  @ApiProperty()
  referrerUserId: number;

  @ApiProperty()
  leadName: string;

  @ApiProperty()
  leadPhone: string;

  @ApiPropertyOptional()
  leadEmail?: string;

  @ApiPropertyOptional()
  requirementNote?: string;
}
