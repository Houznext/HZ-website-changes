import { IsOptional, IsString, MaxLength } from 'class-validator';

export class PatchLeadDto {
  @IsOptional()
  @IsString()
  stage?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  lastContactNote?: string;

  @IsOptional()
  lastContactedAt?: Date;

  @IsOptional()
  nextFollowUpAt?: Date;

  @IsOptional()
  @IsString()
  budget?: string;
}
