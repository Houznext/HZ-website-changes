import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PermissionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty()
  @IsBoolean()
  view: boolean;

  @ApiProperty()
  @IsBoolean()
  create: boolean;

  @ApiProperty()
  @IsBoolean()
  edit: boolean;

  @ApiProperty()
  @IsBoolean()
  delete: boolean;
}

export class CreateBranchRoleDto {
  @ApiProperty()
  // @IsInt()
  @IsUUID()
  branchId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  roleName: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isBranchHead?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions?: PermissionDto[];

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  seedDefaultPermissions?: boolean = true;
}

export class UpdateBranchRoleDto extends PartialType(CreateBranchRoleDto) {}

export class UpsertPermissionsDto {
  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions: PermissionDto[];

  // If true (default), permissions not listed will be removed
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  replaceMissing?: boolean = true;
}
