import { IsBoolean, IsOptional, IsString, IsUUID, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class InfraPermissionFlagDto {
  @IsString()
  resource: string;

  @IsBoolean()
  @IsOptional()
  view?: boolean;

  @IsBoolean()
  @IsOptional()
  create?: boolean;

  @IsBoolean()
  @IsOptional()
  edit?: boolean;

  @IsBoolean()
  @IsOptional()
  delete?: boolean;
}

export class CreateInfraBranchRoleDto {
  @IsUUID()
  branchId: string;

  @IsString()
  roleName: string;

  @IsBoolean()
  @IsOptional()
  isBranchHead?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InfraPermissionFlagDto)
  @IsOptional()
  permissions?: InfraPermissionFlagDto[];

  /** When true (default), seed defaults from roleName when permissions omitted. */
  @IsBoolean()
  @IsOptional()
  seedDefaultPermissions?: boolean;
}

export class UpdateInfraBranchRoleDto {
  @IsString()
  @IsOptional()
  roleName?: string;

  @IsBoolean()
  @IsOptional()
  isBranchHead?: boolean;
}

export class UpsertInfraBranchRolePermissionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InfraPermissionFlagDto)
  permissions: InfraPermissionFlagDto[];

  @IsBoolean()
  @IsOptional()
  replaceMissing?: boolean;
}
