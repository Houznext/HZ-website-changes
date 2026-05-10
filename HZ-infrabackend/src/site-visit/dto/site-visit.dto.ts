import { IsEmail, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateSiteVisitDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsString()
  @MaxLength(20)
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  preferredDate?: string;

  @IsOptional()
  @IsString()
  preferredSlot?: string;

  @IsOptional()
  @IsUUID()
  propertyId?: string;
}

export class PatchSiteVisitDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  preferredDate?: string;

  @IsOptional()
  @IsString()
  preferredSlot?: string;
}
