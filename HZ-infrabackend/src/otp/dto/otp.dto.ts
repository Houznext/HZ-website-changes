import { IsEmail, IsOptional, IsString, Length, Matches, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiPropertyOptional()
  @ValidateIf((o) => !o.phone)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @ValidateIf((o) => !o.email)
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/)
  phone?: string;
}

export class VerifyOtpDto {
  @ApiPropertyOptional()
  @ValidateIf((o) => !o.phone)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @ValidateIf((o) => !o.email)
  @IsString()
  phone?: string;

  @IsString()
  @Length(6, 6)
  otp: string;
}
