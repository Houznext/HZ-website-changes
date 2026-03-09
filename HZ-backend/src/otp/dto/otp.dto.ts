import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { isMatch } from 'date-fns';

export class SendOtpDto {
  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Invalid phone number' })
  phone?: string;
}

export class VerifyOtpDto {
  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Invalid phone number' })
  phone?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  otp: string;

}
export class VerifyPasswordDto {
  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Invalid phone number' })
  phone?: string;

  @ApiProperty()
  @IsString()
  password: string;

}

export class ReturnOtpDto {
  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Invalid phone number' })
  phone?: string;

  @ApiProperty()
  @IsEmail()
  message: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  existingUser?: any;

  @ApiProperty()
  @IsBoolean()
  userstatus?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  token?: string;

  @ApiProperty()
  @IsOptional()
  branchMemberships?: any[];
}

export class ExistingUser {
  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Invalid phone number' })
  phone?: string;
}

export class userStatus {
  @ApiProperty()
  @IsBoolean()
  status: boolean;

  @ApiProperty()
  @IsString()
  message: string;
}
