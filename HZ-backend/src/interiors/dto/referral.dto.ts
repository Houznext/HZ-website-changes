import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateReferralDto {
  @IsString()
  referredName: string;

  @IsString()
  referredMobile: string;

  @IsOptional()
  @IsEmail()
  referredEmail?: string;
}

export class UpdateReferralStatusDto {
  @IsString()
  status: string;
}
