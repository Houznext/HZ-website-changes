import { IsString, IsOptional, IsEmail, MinLength } from 'class-validator';

export class SendOtpDto {
  @IsString()
  mobile: string;
}

export class VerifyOtpDto {
  @IsString()
  mobile: string;

  @IsString()
  otp: string;
}

export class LoginOtpDto {
  @IsString()
  mobile: string;

  @IsString()
  otp: string;
}

export class LoginPasswordDto {
  @IsString()
  mobile: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginRepDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class SetPasswordDto {
  @IsString()
  @MinLength(6)
  password: string;
}
