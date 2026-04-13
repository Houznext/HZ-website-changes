import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
  IsNumber,
} from 'class-validator';

export class CustomerDetailsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @Transform(({ value }) => value.trim())
  @Matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/, {
    message:
      'First name should only contain letters and spaces between words, with no spaces at the start or end',
  })
  firstName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @Transform(({ value }) => value.trim())
  @Matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/, {
    message:
      'Last name should only contain letters and spaces between words, with no spaces at the start or end',
  })
  lastName!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail({}, { message: 'A valid email is required' })
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{7,}$/, {
    message:
      'Password must be at least 10 characters, include one uppercase, one number, and one special character',
  })
  password!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[6-9]\d{9}$/, {
    message:
      'Phone number must start with 6, 7, 8, or 9, and be 10 digits long',
  })
  phone!: string;

  // New: branch context, onboarding helpers
  @ApiProperty({ required: false, description: 'Branch ID to attach membership' })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiProperty({
    required: false,
    description:
      'If true, assign BranchRole "Customer" in the given branch (defaults true)',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  assignCustomerBranchRole?: boolean;

  @ApiProperty({
    required: false,
    description:
      'If true, create a skeleton CustomBuilder record scoped to branch & customer',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  createCustomBuilder?: boolean;
}

export class UpdateCustomerDetails {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail({}, { message: 'A valid email is required' })
  email?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @Transform(({ value }) => value.trim())
  @Matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/)
  firstName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @Transform(({ value }) => value.trim())
  @Matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/)
  lastName!: string;
}

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
