import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsArray, IsUUID, Min, MaxLength } from 'class-validator';

/**
 * DTO for admin-only "apply free promotion" flow (e.g. collabs, partnerships).
 * Applies a premium plan's promotion to a property without payment.
 */
export class ApplyFreePromotionDto {
  @ApiProperty({ description: 'Property to promote', example: 'uuid' })
  @IsUUID()
  propertyId: string;

  @ApiPropertyOptional({ description: 'Plan by ID (use planId or planSlug)' })
  @IsOptional()
  @IsUUID()
  planId?: string;

  @ApiPropertyOptional({ description: 'Plan by slug (use planId or planSlug)', example: 'featured-30-days' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  planSlug?: string;

  @ApiPropertyOptional({ description: 'Override duration in days; defaults to plan.durationDays', default: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;

  @ApiPropertyOptional({ description: 'Reason/note for audit (e.g. "Collab with X")' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({
    description: 'Tags for display (e.g. Collab, Partner)',
    example: ['Collab', 'Partner'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  promotionTags?: string[];
}
