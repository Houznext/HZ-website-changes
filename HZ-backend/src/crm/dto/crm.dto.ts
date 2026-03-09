import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
  IsDateString,
  ValidateIf,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import {
  Categories,
  LeadStatus,
  PropertyTypeEnum,
  ServiceCategory,
  PlatForm,
  PaintingPackageEnum,
  PaintingTypeEnum,
} from '../enums/crm.enum';

/**
 * Rooms
 */
export class RoomsDto {
  @ApiProperty({ description: 'Number of living rooms' })
  @Type(() => Number)
  @IsOptional()
  livingRoom?: number;

  @ApiProperty({ description: 'Number of kitchens' })
  @Type(() => Number)
  @IsOptional()
  kitchen?: number;

  @ApiProperty({ description: 'Number of bedrooms' })
  @Type(() => Number)
  @IsOptional()
  bedroom?: number;

  @ApiProperty({ description: 'Number of bathrooms' })
  @Type(() => Number)
  @IsOptional()
  bathroom?: number;

  @ApiProperty({ description: 'Number of dining rooms', required: false })
  @Type(() => Number)
  @IsOptional()
  dining?: number;
}

export class CreateCrmLeadDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  Fullname: string;

  @ApiProperty()
  @Matches(/^[6-9]\d{9}$/, {
    message:
      'Phone number must start with 6, 7, 8, or 9, and be 10 digits long',
  })
  @IsString()
  @IsNotEmpty()
  Phonenumber: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ enum: PropertyTypeEnum })
  @IsEnum(PropertyTypeEnum)
  @IsOptional()
  propertytype?: PropertyTypeEnum;

  @ApiPropertyOptional({ enum: PaintingPackageEnum })
  @IsEnum(PaintingPackageEnum)
  @IsOptional()
  paintingPackage?: PaintingPackageEnum;

  @ApiPropertyOptional({ enum: PaintingTypeEnum })
  @IsEnum(PaintingTypeEnum)
  @IsOptional()
  paintingType?: PaintingTypeEnum;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  paintArea?: string;

  @ApiPropertyOptional({ enum: PlatForm })
  @Transform(({ value }) =>
  value === '' || value === null || value === undefined
    ? undefined
    : value
)
@IsEnum(PlatForm)
@IsOptional()
  platform?: PlatForm;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bhk?: string;

  @ApiPropertyOptional({
    enum: ServiceCategory,
    description: `One of: ${Object.values(ServiceCategory).join(', ')}`,
  })
  @IsEnum(ServiceCategory)
  @IsOptional()
  serviceType?: ServiceCategory;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ enum: Categories })
  @IsEnum(Categories)
  @IsOptional()
  category?: Categories;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  monthly_bill?: number;

  @ApiPropertyOptional({ type: RoomsDto })
  @ValidateNested()
  @Type(() => RoomsDto)
  @IsOptional()
  rooms?: RoomsDto;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  package?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  pincode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  review?: string;

  @ApiPropertyOptional({ enum: LeadStatus })
  @IsEnum(LeadStatus)
  @IsOptional()
  leadstatus?: LeadStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  apartmentName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  areaName?: string;

  @ApiPropertyOptional({ description: 'ISO date for scheduled visit' })
  @IsOptional()
  @IsDateString()
  visitScheduledAt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  houseNo?: string;

  @ApiPropertyOptional({ description: 'Mark as potential future client' })
  @IsOptional()
  isFuturePotential?: boolean;

  /** Assignment on create (optional) */
  @ApiPropertyOptional({ description: 'User ID to assign this lead to' })
  @Type(() => String)
  @IsString()
  @IsOptional()
  assignedToId?: string;

  /** Audit: created by which user (MANDATORY for your flow) */
  @ApiPropertyOptional({ description: 'Audit: createdBy user id' })
  @Type(() => String)
  @IsString()
  @IsOptional()
  createdById?: string;

  /** Branch scope (MANDATORY – you will enforce in controller) */
  @ApiPropertyOptional({ description: 'Branch scope of the lead' })
  @Type(() => String)
  @IsString()
  @IsOptional()
  branchId?: string;
}

export class UpdateCrmLeadDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  Fullname?: string;

  @ApiPropertyOptional()
  @Matches(/^[6-9]\d{9}$/, {
    message:
      'Phone number must start with 6, 7, 8, or 9, and be 10 digits long',
  })
  @IsString()
  @IsOptional()
  Phonenumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ enum: PropertyTypeEnum })
  @IsEnum(PropertyTypeEnum)
  @IsOptional()
  propertytype?: PropertyTypeEnum;

  @ApiPropertyOptional({ enum: PlatForm })
  @IsEnum(PlatForm)
  @IsOptional()
  platform?: PlatForm;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bhk?: string;

  @ApiPropertyOptional({
    enum: ServiceCategory,
    description: `One of: ${Object.values(ServiceCategory).join(', ')}`,
  })
  @IsEnum(ServiceCategory)
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  serviceType?: ServiceCategory;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  review?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ enum: Categories })
  @IsEnum(Categories)
  @IsOptional()
  category?: Categories;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  monthly_bill?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  pincode?: string;

  @ApiPropertyOptional({ enum: LeadStatus })
  @IsEnum(LeadStatus)
  @IsOptional()
  leadstatus?: LeadStatus;

  @ApiPropertyOptional({ type: Number })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  phase?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  houseNo?: string;

  @ApiPropertyOptional({ enum: PaintingPackageEnum })
  @IsEnum(PaintingPackageEnum)
  @IsOptional()
  paintingPackage?: PaintingPackageEnum;

  @ApiPropertyOptional({ enum: PaintingTypeEnum })
  @IsEnum(PaintingTypeEnum)
  @IsOptional()
  paintingType?: PaintingTypeEnum;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  paintArea?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  apartmentName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  areaName?: string;

  @ApiPropertyOptional({ description: 'ISO date for scheduled visit' })
  @IsOptional()
  @IsDateString()
  visitScheduledAt?: string;

  @ApiPropertyOptional({ description: 'Mark as potential future client' })
  @IsOptional()
  isFuturePotential?: boolean;

  /** Reassignment through PATCH (optional) */
  @ApiPropertyOptional({ description: 'Reassign to this user id' })
  @Type(() => Number)
  @IsString()
  @IsOptional()
  assignedToId?: string;

  /** Optional branch move (guarded) */
  @ApiPropertyOptional({ description: 'Move lead to another branch (guarded)' })
  @Type(() => String)
      @IsString()
  @IsOptional()
  branchId?: string;

  /** Audit -> who is doing the update */
  @ApiPropertyOptional({ description: 'Actor user id performing the update' })
  @Type(() => String)
  @IsString()
  @IsOptional()
  actorId?: string;

  @ApiPropertyOptional({
    description: 'Actor branch id (for audit/logging if needed)',
  })
  @Type(() => String)
  @IsString()
  @IsOptional()
  actorBranchId?: string;
}

export class ReturnCrmLeadDto {
  id: string;
  Fullname: string;
  Phonenumber: string;
  email: string;
  platform?: PlatForm;
  serviceType?: ServiceCategory;
  propertytype: PropertyTypeEnum;
  paintingPackage?: PaintingPackageEnum;
  paintingType?: PaintingTypeEnum;
  bhk: string;
  review: string;
  city: string;
  state: string;
  package: string;
  leadstatus: LeadStatus;
  rooms?: RoomsDto;
  createdAt: Date;
  updatedAt?: Date;
  phase?: string;
  visitDoneAt?: Date;
  followUpDate?: Date;
  visitScheduledAt?: Date;
  areaName?: string;
  houseNo?: string;
  apartmentName?: string;
  paintArea?: string;
  branchId: string;
  assignedTo?: string | null;
  assignedBy?: string | null;
  rejectionReason?: string | null;
  isFuturePotential?: boolean;
  createdBy?: string | null;
}

export class UpdateCrmLeadstatusDto {
  @ApiProperty()
  @IsEnum(LeadStatus)
  @IsNotEmpty()
  leadstatus: LeadStatus;

  @ApiProperty({
    required: false,
    description: 'ISO date if status = Follow-up',
  })
  @ValidateIf((o) => o.leadstatus === LeadStatus.Follow_up)
  @IsDateString()
  followUpDate?: string;

  @ApiProperty({
    required: false,
    description: 'ISO date if status = Visit Scheduled',
  })
  @ValidateIf((o) => o.leadstatus === LeadStatus.Visit_Scheduled)
  @IsDateString()
  visitScheduledAt?: string;

  @ApiProperty({
    required: false,
    description: 'ISO date if status = Visit Done',
  })
  @ValidateIf((o) => o.leadstatus === LeadStatus.Visit_Done)
  @IsDateString()
  visitDoneAt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  review?: string;

  @ApiPropertyOptional({
    description: 'Reason for rejection (required when status = Not Interested)',
  })
  @ValidateIf((o) =>
    o.leadstatus === LeadStatus.NotInterested ||
    o.leadstatus === LeadStatus.Rejected ||
    o.leadstatus === LeadStatus.Lost,
  )
  @IsString()
  @IsOptional()
  rejectionReason?: string;

  /** audit info (who changes status, from which branch) */
  @ApiPropertyOptional({ description: 'Actor user id performing status change' })
  @Type(() => String)
  @IsString()
  @IsOptional()
  actorId?: string;

  @ApiPropertyOptional({ description: 'Actor branch id' })
  @Type(() => String)
  @IsString()
  @IsOptional()
  actorBranchId?: string;
}

export class BulkCreateLeadsDto {
  @ApiProperty({ type: [CreateCrmLeadDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateCrmLeadDto)
  leads: CreateCrmLeadDto[];

  @ApiProperty({ description: 'Branch id for all leads' })
  @Type(() => String)
  @IsString()
  branchId: string;

  @ApiProperty({ description: 'CreatedBy id for all leads' })
  @Type(() => String)
  @IsString()
  createdById: string;
}

/**
 * Query filters for list API
 */
export class QueryCrmLeadDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page size', default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filter by status', enum: LeadStatus })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @ApiPropertyOptional({ description: 'Free text: name/phone/email/city' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by assignedTo user id' })
  @Type(() => String)
  @IsString()
  @IsOptional()
  assignedToId?: string;

  @ApiPropertyOptional({
    description:
      'Start date in ISO (inclusive). If provided, also provide endDate',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description:
      'End date in ISO (inclusive). If provided, also provide startDate',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description:
      'Branch filter. (REQUIRED in your controller if you are not using auth)',
  })
  @Type(() => String)
  @IsString()
  @IsOptional()
  branchId?: string;
}

export class AssignLeadBodyDto {
  @ApiProperty()
  @Type(() => Number)
  @IsString()
  leadId: string;

  @ApiProperty()
  @Type(() => String)
  @IsString()
  assignedToId: string;

  @ApiProperty({ description: 'Admin/actor user id doing assignment' })
  @Type(() => String)
  @IsString()
  adminId: string;

  @ApiProperty({ description: 'Branch id for this lead/assignment' })
  @Type(() => String)
  @IsString()
  branchId: string;
}

export class FindLeadsDto {
  @ApiProperty({ description: 'User id whose leads you want' })
  @Type(() => String)
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Branch id scope' })
  @Type(() => String)
  @IsString()
  branchId: string;

  @ApiPropertyOptional({ description: 'Start date (ISO)' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (ISO)' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter only Future Potential leads (pass "true" for yes)',
  })
  @Transform(({ value }) =>
    value === 'true' || value === true ? true : value === 'false' || value === false ? false : undefined,
  )
  @IsBoolean()
  @IsOptional()
  isFuturePotential?: boolean;
}

export type BulkMessageChannel = 'whatsapp' | 'sms' | 'both';

export class BulkSendLeadsDto {
  @ApiProperty({ type: [String], description: 'Lead IDs to send messages to' })
  leadIds: string[];

  @ApiProperty({
    enum: ['whatsapp', 'sms', 'both'],
    description: 'Channel to use for sending',
  })
  @IsString()
  channel: BulkMessageChannel;

  @ApiPropertyOptional({ description: 'Custom message (optional; uses default template if not provided)' })
  @IsString()
  @IsOptional()
  customMessage?: string;

  @ApiPropertyOptional({ description: 'Branch id scope for validation' })
  @Type(() => String)
  @IsString()
  @IsOptional()
  branchId?: string;
}
