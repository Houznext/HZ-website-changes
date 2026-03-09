import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEmpty,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { AddressDto, UpdateAddressDto } from 'src/Address/dto/address.dto';
import { IndianState, UserKind, UserRole } from '../enum/user.enum';
import { PermissionResourceEnum } from 'src/permission/enum/permission.enum';
import { BranchMembershipLite } from 'src/branch-role-permission/dto/branch-role-permission.dto';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'A valid email is required' })
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Password is required' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{7,}$/, {
    message:
      'Password must be at least 10 characters long, contain one uppercase letter, one number, and one special character',
  })
  password?: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  agent: boolean;

  @ApiProperty()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[6-9]\d{9}$/, {
    message:
      'Phone number must start with 6, 7, 8, or 9, and be 10 digits long',
  })
  phone: string;
}

export class LoginUserDto {
  @ApiProperty()
  @IsOptional()
  @IsEmail({}, { message: 'A valid email is required' })
  email: string;

  @ApiProperty()
  @IsOptional()
  @Matches(/^[6-9]\d{9}$/, {
    message:
      'Phone number must start with 6, 7, 8, or 9, and be 10 digits long',
  })
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    description: 'Optional branch the user is selecting at login',
  })
  @IsOptional()
  @IsString()
  branchId?: string;
}
export class ReturnLoginUserDto {
  @ApiProperty()
  @IsEmpty()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsEmpty()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsEmpty()
  @IsEmail()
  message: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  user?: any;

  @ApiProperty()
  @IsBoolean()
  userstatus?: boolean;

  @ApiProperty()
  @ApiProperty()
  @IsOptional()
  @IsString()
  token?: string;
}

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail({}, { message: 'A valid email is required' })
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profile?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  @Matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/, {
    message:
      'First name should only contain letters and spaces between words, with no spaces at the start or end',
  })
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  @Matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/, {
    message:
      'Last name should only contain letters and spaces between words, with no spaces at the start or end',
  })
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(/^[6-9]\d{9}$/, {
    message:
      'Phone number must start with 6, 7, 8, or 9, and be 10 digits long',
  })
  phone?: string;

  @ApiProperty({ type: [UpdateAddressDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  addresses?: UpdateAddressDto[];
}

export class ReturnUserDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional({ nullable: true })
  profile: string;

  @ApiProperty()
  username: string;

  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName: string;

  @ApiPropertyOptional()
  phone: string;

  @ApiPropertyOptional()
  email: string;

  @ApiPropertyOptional()
  createdAt?: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional({ type: () => [AddressDto] })
  @Type(() => AddressDto)
  addresses?: AddressDto[];

  @ApiProperty({ enum: UserKind })
  kind: UserKind;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiPropertyOptional({ type: () => [BranchMembershipLite] })
  @Type(() => BranchMembershipLite)
  branchMemberships?: BranchMembershipLite[];
}
export class userTokenReponse {
  @ApiProperty({ type: () => ReturnUserDto })
  user: ReturnUserDto;

  @ApiProperty()
  token: string;

  @ApiProperty({ type: [BranchMembershipLite], required: false })
  branchMemberships?: BranchMembershipLite[];
}

export class ReturnUserAdminDto {
  id: string;
  username: string;
  firstName?: string;
  phone: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  kind: UserKind;
  role: UserRole;
  message?: string;
  createdById?: string | null;
}

export class CreateAdminUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail({}, { message: 'A valid email is required' })
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @Transform(({ value }) => value.trim())
  @Matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/, {
    message:
      'First name should only contain letters and spaces between words, with no spaces at the start or end',
  })
  firstName?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @Transform(({ value }) => value.trim())
  @Matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/, {
    message:
      'Last name should only contain letters and spaces between words, with no spaces at the start or end',
  })
  lastName?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{7,}$/, {
    message:
      'Password must be at least 10 characters long, contain one uppercase letter, one number, and one special character',
  })
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[6-9]\d{9}$/, {
    message:
      'Phone number must start with 6, 7, 8, or 9, and be 10 digits long',
  })
  phone: string;

  @ApiProperty({ type: [String], enum: IndianState, isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(IndianState, { each: true })
  states: IndianState[];

  @ApiProperty({ description: 'Branch role name to assign' })
  @IsNotEmpty()
  @IsString()
  roleName: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @IsNotEmpty({ message: 'Password is required' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{7,}$/, {
    message:
      'Password must be at least 10 characters long, contain one uppercase letter, one number, and one special character',
  })
  newPassword: string;

  @ApiProperty()
  @IsString()
  confirmPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Email address to send reset link' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'A valid email is required' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'NewPassword123!',
    description: 'New password for the user',
  })
  @IsNotEmpty({ message: 'New password is required' })
  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{7,}$/, {
    message:
      'Password must be at least 7 characters long, contain one uppercase letter, one number, and one special character',
  })
  newPassword: string;

  @ApiProperty({
    example: 'reset-token-here',
    description: 'Token for password reset received via email',
  })
  @IsNotEmpty({ message: 'Reset token is required' })
  @IsString()
  token: string;
}

export const PermissionTables = [
  'blog',
  'user',
  'role',
  'company_property',
  'property',
  'project',
  'access_control',
  'home_decor',
  'electronics',
  'furniture',
  'custom_builder',
  'careers',
  'cost_estimator',
];

// src/permission/constants/resource-groups.ts

export const RESOURCE_GROUPS: Record<string, string[]> = {
  property: [
    'property',
    'basic_details',
    'location_details',
    'media_details',
    'property_details',
    'plot_attributes',
    'pricing_details',
    'residential_attributes',
    'commercial_attribute',
    'facilities',
    'flatshare_attributes',
    'wishlist_items',
    'reviews',
    'property_lead',
    'otp',
  ],

  company_property: [
    'company',
    'project',
    'location_details',
    'media_details',
    'construction_status',
    'property_type',
    'sellers',
    'developer_information',
    'award',
    'otp',
  ],

  custom_builder: [
    'custom_builder',
    'cb_property',
    'cb_service',
    'house_construction',
    'interior_info',
    'borewell',
    'centring',
    'flooring',
    'plumbing',
    'painting',
    'electricity',
    'fall_ceiling',
    'brick_masonry',
    'document_drafting',
    'interior_service',
    'location_details',
    'daily_progress',
    'cb_query',
    'invoice_estimator',
    'otp',
  ],

  furniture: [
    'furniture',
    'furniture_leads',
    'home_decors',
    'electronics',
    'order_address',
    'order_line',
    'order_status',
    'store_order',
    'wishlist',
    'otp',
  ],

  careers: ['career', 'applicant', 'job_role', 'job_department'],

  cost_estimator: ['cost_estimator', 'item_group', 'invoice_estimator', 'otp'],
};

//dto for new code user creation

export class CreateAdminUserCoreDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  @Matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/)
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  @Matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/)
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{7,}$/)
  password?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[6-9]\d{9}$/)
  phone: string;

  @ApiProperty({ type: [String], enum: IndianState, isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(IndianState, { each: true })
  states: IndianState[];
}

export class BranchAssignmentDto {
  @ApiProperty()
  @IsString()
  branchId: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  branchRoleIds: string[];
  @ApiProperty({ enum: UserKind })
  @IsEnum(UserKind)
  kind: UserKind;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isBranchHead?: boolean;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
export class CreateAdminUserWithBranchDto {
  @ApiProperty({ type: CreateAdminUserCoreDto })
  @ValidateNested()
  @Type(() => CreateAdminUserCoreDto)
  user: CreateAdminUserCoreDto;

  @ApiProperty({ type: BranchAssignmentDto })
  @ValidateNested()
  @Type(() => BranchAssignmentDto)
  membership: BranchAssignmentDto;
}

//admin facing

export type PermissionDto = {
  resource: PermissionResourceEnum;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
};
export class ReturnAdminUserCoreDto {
  @ApiProperty() id: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty() email: string;
  @ApiProperty() phone: string;
  @ApiProperty({ type: [String] }) states: string[];
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ required: false }) message?: string;
  @ApiProperty({ required: false, nullable: true }) createdById?: string | null;
}
export class ReturnBranchRoleDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  roleName: string;

  // @ApiProperty({ type: [String] })
  // permissions: string[];
}

export class ReturnBranchAssignmentDto {
  @ApiProperty() branchId: string;
  // @ApiProperty({ type: [Number] }) branchRoleIds: number[];
  @ApiProperty({ type: [ReturnBranchRoleDto] })
  branchRoles: ReturnBranchRoleDto[];

  @ApiProperty({ enum: UserKind }) kind: UserKind;
  @ApiProperty({ default: false }) isBranchHead?: boolean;
  @ApiProperty({ default: true }) isPrimary?: boolean;
}

export class ReturnAdminUserWithBranchDto {
  @ApiProperty({ type: ReturnAdminUserCoreDto }) user: ReturnAdminUserCoreDto;
  @ApiProperty({ type: ReturnBranchAssignmentDto })
  membership: ReturnBranchAssignmentDto;
}

export class GetUsersFilterDto {
  @ApiPropertyOptional({
    enum: UserKind,
    description: 'Filter users by kind (CUSTOMER / ADMIN / etc.)',
    example: UserKind.CUSTOMER,
  })
  @IsOptional()
  @IsEnum(UserKind)
  kind?: UserKind;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  createdById?: string;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'createdAt',
    default: 'createdAt',
    enum: ['id', 'createdAt', 'updatedAt', 'fullName', 'username'],
  })
  @IsOptional()
  @IsIn(['id', 'createdAt', 'updatedAt', 'fullName', 'username'])
  sortBy?: 'id' | 'createdAt' | 'updatedAt' | 'fullName' | 'username';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'DESC',
    default: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}

export class SeedAdminDto {
  @ApiProperty({ example: 'admin@onecasa.in' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: 'Sachin' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Chavan' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: '9999999999' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 'OneCasa', default: 'OneCasa' })
  @IsOptional()
  @IsString()
  orgName?: string;
}
