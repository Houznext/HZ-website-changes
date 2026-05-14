import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { InfraBranchCategory, InfraBranchLevel } from '../enum/infra-branch.enum';

export class CreateInfraBranchDto {
  @IsString()
  name: string;

  @IsEnum(InfraBranchLevel)
  level: InfraBranchLevel;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsEnum(InfraBranchCategory)
  @IsOptional()
  category?: InfraBranchCategory;

  @IsInt()
  @IsOptional()
  stateId?: number;

  @IsInt()
  @IsOptional()
  cityId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(512)
  branchAddress?: string;

  @IsString()
  @IsOptional()
  branchPhone?: string;

  @IsString()
  @IsOptional()
  branchEmail?: string;

  @IsBoolean()
  @IsOptional()
  isHeadOffice?: boolean;

  @IsBoolean()
  @IsOptional()
  isStateHQ?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateInfraBranchDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(InfraBranchLevel)
  @IsOptional()
  level?: InfraBranchLevel;

  @IsUUID()
  @IsOptional()
  parentId?: string | null;

  @IsEnum(InfraBranchCategory)
  @IsOptional()
  category?: InfraBranchCategory | null;

  @IsInt()
  @IsOptional()
  stateId?: number | null;

  @IsInt()
  @IsOptional()
  cityId?: number | null;

  @IsString()
  @IsOptional()
  branchAddress?: string | null;

  @IsString()
  @IsOptional()
  branchPhone?: string | null;

  @IsString()
  @IsOptional()
  branchEmail?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isHeadOffice?: boolean;

  @IsBoolean()
  @IsOptional()
  isStateHQ?: boolean;
}

export class AssignInfraUserToBranchDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  branchId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  branchRoleIds?: string[];

  @IsBoolean()
  @IsOptional()
  isBranchHead?: boolean;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

export class UpdateInfraBranchMembershipRolesDto {
  @IsArray()
  @IsUUID('4', { each: true })
  branchRoleIds: string[];

  @IsBoolean()
  @IsOptional()
  isBranchHead?: boolean;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
