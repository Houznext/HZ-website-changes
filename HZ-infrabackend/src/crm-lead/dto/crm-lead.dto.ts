import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ListLeadsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  stage?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @IsString()
  budgetRange?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  tab?: string;
}

export class CreateLeadDto {
  @IsString()
  @MaxLength(120)
  fullName: string;

  @IsString()
  @MaxLength(24)
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  email?: string;

  @IsOptional()
  @IsString()
  alternatePhone?: string;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @IsString()
  bhkPreference?: string;

  @IsOptional()
  @IsString()
  budgetRange?: string;

  @IsOptional()
  @IsString()
  preferredCity?: string;

  @IsOptional()
  @IsString()
  preferredLocality?: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsString()
  loanRequired?: string;

  @IsOptional()
  @IsString()
  timeline?: string;

  @IsOptional()
  @IsString()
  stage?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  assignedAgentId?: string;

  @IsOptional()
  @IsDateString()
  nextFollowUpAt?: string;

  @IsOptional()
  @IsString()
  followUpMethod?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  linkedPropertyIds?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}

export class PatchLeadDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string | null;

  @IsOptional()
  @IsString()
  alternatePhone?: string | null;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @IsString()
  bhkPreference?: string | null;

  @IsOptional()
  @IsString()
  budgetRange?: string | null;

  @IsOptional()
  @IsString()
  preferredCity?: string | null;

  @IsOptional()
  @IsString()
  preferredLocality?: string | null;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsString()
  loanRequired?: string;

  @IsOptional()
  @IsString()
  loanStatus?: string | null;

  @IsOptional()
  @IsString()
  timeline?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string | null;

  @IsOptional()
  @IsString()
  assignedAgentId?: string | null;

  @IsOptional()
  @IsDateString()
  nextFollowUpAt?: string | null;

  @IsOptional()
  @IsString()
  followUpMethod?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  linkedPropertyIds?: string[];

  @IsOptional()
  @IsString()
  tokenAmount?: string | null;

  @IsOptional()
  @IsDateString()
  tokenPaidAt?: string | null;

  @IsOptional()
  @IsString()
  bookedPropertyId?: string | null;

  @IsOptional()
  @IsString()
  registrationAmount?: string | null;

  @IsOptional()
  @IsDateString()
  registeredAt?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsString()
  internalNotes?: string | null;

  @IsOptional()
  @IsString()
  lostReason?: string | null;
}

export class PatchStageDto {
  @IsString()
  @MaxLength(40)
  stage: string;

  @IsOptional()
  @IsString()
  tokenAmount?: string;

  @IsOptional()
  @IsDateString()
  tokenPaidAt?: string;

  @IsOptional()
  @IsString()
  bookedPropertyId?: string;

  @IsOptional()
  @IsString()
  agentName?: string;
}

export class PatchPriorityDto {
  @IsString()
  @MaxLength(20)
  priority: string;

  @IsOptional()
  @IsString()
  agentName?: string;
}

export class CreateActivityDto {
  @IsString()
  @MaxLength(40)
  type: string;

  @IsString()
  @MaxLength(8000)
  content: string;

  @IsOptional()
  @IsString()
  agentName?: string;

  @IsOptional()
  @IsString()
  previousStage?: string;

  @IsOptional()
  @IsString()
  newStage?: string;
}

export class CreateSiteVisitDto {
  @IsUUID()
  leadId: string;

  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @IsOptional()
  @IsString()
  propertyTitle?: string;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  agentName?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class PatchSiteVisitDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  feedback?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  agentName?: string;
}

export class BulkAssignDto {
  @IsArray()
  @IsUUID('4', { each: true })
  leadIds: string[];

  @IsOptional()
  @IsString()
  assignedTo?: string | null;

  @IsOptional()
  @IsString()
  assignedAgentId?: string | null;

  @IsOptional()
  @IsString()
  agentName?: string;
}

export class SiteVisitListQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  agentName?: string;
}

export class StatsQueryDto {
  @IsOptional()
  @IsString()
  range?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  agent?: string;
}
