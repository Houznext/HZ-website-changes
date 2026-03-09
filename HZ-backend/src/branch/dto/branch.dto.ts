// src/branch/dto/branch.dto.ts
import { BranchLevel, BranchCategory, OwnerIdProofType } from '../enum/branch.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';

/** Re-export for consumers that import from dto */
export { BranchCategory } from '../enum/branch.enum';

/**
 * Owner payload for branch creation.
 * OTP must already be verified via /otp/verify; otpToken comes from there.
 */
export class BranchOwnerDto {
  @ApiProperty({ example: 'Rohini Bala' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'owner@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Invalid phone number' })
  phone: string;

  @ApiProperty({
    example: 'StrongPass@123',
    required: false,
    description:
      'If omitted, backend may generate a random password or rely on OTP-only login.',
  })
  @IsOptional()
  @IsString()
  password?: string;
}

export class CreateBranchDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: BranchLevel })
  @IsEnum(BranchLevel)
  level: BranchLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  isHeadOffice?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isStateHQ?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  stateId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  cityId?: number;

  @ApiProperty({
    required: false,
    enum: BranchCategory,
    description:
      'Branch type (ORGANIZATION for org/full access, LEGAL, FURNITURE, INTERIORS, etc.). Default: GENERAL.',
  })
  @IsOptional()
  @IsEnum(BranchCategory)
  category?: BranchCategory;

  @ApiProperty({
    required: false,
    description:
      'Whether franchise fee has been paid/confirmed for this branch.',
  })
  @IsOptional()
  @IsBoolean()
  hasFranchiseFeePaid?: boolean;

  @ApiProperty({
    required: false,
    description:
      'Reference id / transaction id for franchise payment (Razorpay, Stripe, etc.)',
  })
  @IsOptional()
  @IsString()
  franchisePaymentRef?: string;

  // ── Owner identity / verification (all optional) ──

  @ApiProperty({ required: false, description: '12-digit Aadhaar card number' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{12}$/, { message: 'Aadhaar must be exactly 12 digits' })
  ownerAadhaarNumber?: string;

  @ApiProperty({ required: false, description: 'PAN card number (e.g. ABCDE1234F)' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/, { message: 'Invalid PAN format (e.g. ABCDE1234F)' })
  ownerPanNumber?: string;

  @ApiProperty({ required: false, description: 'GST number (15-char alphanumeric)' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z][Z][0-9A-Z]$/, {
    message: 'Invalid GST format (e.g. 22AAAAA0000A1Z5)',
  })
  ownerGstNumber?: string;

  @ApiProperty({ required: false, enum: OwnerIdProofType, description: 'Type of govt ID proof uploaded' })
  @IsOptional()
  @IsEnum(OwnerIdProofType)
  ownerIdProofType?: OwnerIdProofType;

  @ApiProperty({ required: false, description: 'URL of uploaded govt ID proof document' })
  @IsOptional()
  @IsString()
  ownerIdProofUrl?: string;

  @ApiProperty({ required: false, description: 'URL of owner photo' })
  @IsOptional()
  @IsString()
  ownerPhotoUrl?: string;

  @ApiProperty({ required: false, description: 'Owner date of birth (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  ownerDateOfBirth?: string;

  @ApiProperty({ required: false, description: 'Owner residential address' })
  @IsOptional()
  @IsString()
  ownerAddress?: string;

  // ── Branch physical details (all optional) ──

  @ApiProperty({ required: false, description: 'Branch office address' })
  @IsOptional()
  @IsString()
  branchAddress?: string;

  @ApiProperty({ required: false, description: 'Branch contact phone (10 digits)' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Branch phone must be exactly 10 digits' })
  branchPhone?: string;

  @ApiProperty({ required: false, description: 'Branch contact email' })
  @IsOptional()
  @IsEmail()
  branchEmail?: string;

  @ApiProperty({ required: false, description: 'URL of branch office photo' })
  @IsOptional()
  @IsString()
  branchPhotoUrl?: string;

  @ApiProperty({
    required: false,
    type: () => BranchOwnerDto,
    description:
      'If provided, backend will create/attach a branch-head STAFF user + role + permissions.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BranchOwnerDto)
  owner?: BranchOwnerDto;
}

export class UpdateBranchDto {
  @ApiProperty({ required: false })
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false, enum: BranchLevel })
  @IsOptional()
  @IsEnum(BranchLevel)
  level?: BranchLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  isHeadOffice?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isStateHQ?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  stateId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  cityId?: number;

  @ApiProperty({
    required: false,
    enum: BranchCategory,
    description: 'Change branch business category',
  })
  @IsOptional()
  @IsEnum(BranchCategory)
  category?: BranchCategory;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasFranchiseFeePaid?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  franchisePaymentRef?: string;

  // ── Owner identity / verification (all optional) ──

  @ApiProperty({ required: false, description: '12-digit Aadhaar card number' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{12}$/, { message: 'Aadhaar must be exactly 12 digits' })
  ownerAadhaarNumber?: string;

  @ApiProperty({ required: false, description: 'PAN card number (e.g. ABCDE1234F)' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/, { message: 'Invalid PAN format (e.g. ABCDE1234F)' })
  ownerPanNumber?: string;

  @ApiProperty({ required: false, description: 'GST number (15-char alphanumeric)' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z][Z][0-9A-Z]$/, {
    message: 'Invalid GST format (e.g. 22AAAAA0000A1Z5)',
  })
  ownerGstNumber?: string;

  @ApiProperty({ required: false, enum: OwnerIdProofType, description: 'Type of govt ID proof uploaded' })
  @IsOptional()
  @IsEnum(OwnerIdProofType)
  ownerIdProofType?: OwnerIdProofType;

  @ApiProperty({ required: false, description: 'URL of uploaded govt ID proof document' })
  @IsOptional()
  @IsString()
  ownerIdProofUrl?: string;

  @ApiProperty({ required: false, description: 'URL of owner photo' })
  @IsOptional()
  @IsString()
  ownerPhotoUrl?: string;

  @ApiProperty({ required: false, description: 'Owner date of birth (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  ownerDateOfBirth?: string;

  @ApiProperty({ required: false, description: 'Owner residential address' })
  @IsOptional()
  @IsString()
  ownerAddress?: string;

  // ── Branch physical details (all optional) ──

  @ApiProperty({ required: false, description: 'Branch office address' })
  @IsOptional()
  @IsString()
  branchAddress?: string;

  @ApiProperty({ required: false, description: 'Branch contact phone (10 digits)' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Branch phone must be exactly 10 digits' })
  branchPhone?: string;

  @ApiProperty({ required: false, description: 'Branch contact email' })
  @IsOptional()
  @IsEmail()
  branchEmail?: string;

  @ApiProperty({ required: false, description: 'URL of branch office photo' })
  @IsOptional()
  @IsString()
  branchPhotoUrl?: string;

  @ApiProperty({
    required: false,
    type: () => BranchOwnerDto,
    description: 'Update/assign branch owner (branch head). Must be OTP verified.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BranchOwnerDto)
  owner?: BranchOwnerDto;
}

// ---------- existing membership DTOs (unchanged) ----------

export class AssignUserToBranchDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  userId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsString()
  branchId: string;

  @ApiProperty({ example: ['550e8400-e29b-41d4-a716-446655440002'], description: 'BranchRole IDs' })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  branchRoleIds: string[];

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isBranchHead?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class SwitchBranchDto {
  @ApiProperty()
  @IsString()
  branchId: string;
}

export class BranchWithIdDto {
  @ApiProperty()
  branchName: string;

  @ApiProperty()
  branchId: string;
}
