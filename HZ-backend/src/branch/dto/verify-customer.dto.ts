import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ required: false, example: 'user@example.com' })
  @ValidateIf((o) => o.email !== undefined)
  @IsEmail({}, { message: 'A valid email is required' })
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false, example: '9876543210' })
  @ValidateIf((o) => o.phone !== undefined)
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Phone number must start with 6/7/8/9 and have 10 digits',
  })
  @IsOptional()
  phone?: string;
}

export class VerifyCustomerOtpDto {
  @ApiProperty({ required: false })
  @ValidateIf((o) => o.email !== undefined)
  @IsEmail({}, { message: 'A valid email is required' })
  email?: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.phone !== undefined)
  @Matches(/^[6-9]\d{9}$/, { message: 'Invalid phone number format' })
  phone?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  otp!: string;
}
