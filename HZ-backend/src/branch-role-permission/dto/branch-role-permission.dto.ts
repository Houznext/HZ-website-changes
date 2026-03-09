import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

import { ApiProperty } from '@nestjs/swagger';
import { BranchLevel } from 'src/branch/enum/branch.enum';
import { ReturnUserDto } from 'src/user/dto/user.dto';

export class CreateBranchRolePermissionDto {
  @IsString() branchRoleId: string ;
  @IsString() @IsNotEmpty() resource: string;
  @IsOptional() @IsBoolean() view?: boolean;
  @IsOptional() @IsBoolean() create?: boolean;
  @IsOptional() @IsBoolean() edit?: boolean;
  @IsOptional() @IsBoolean() delete?: boolean;
}

export class UpdateBranchRolePermissionDto extends PartialType(
  CreateBranchRolePermissionDto,
) {}

export class BranchPermissionLite {
  @ApiProperty()
  id: string;

  @ApiProperty()
  resource: string; // or PermissionResourceEnum

  @ApiProperty()
  view: boolean;

  @ApiProperty()
  create: boolean;

  @ApiProperty()
  edit: boolean;

  @ApiProperty()
  delete: boolean;
}

export class BranchMembershipLite {
  @ApiProperty()
  branchId: string;

  @ApiProperty()
  branchName: string;

  @ApiProperty({ enum: BranchLevel })
  level: BranchLevel;

  @ApiProperty()
  isBranchHead: boolean;

  @ApiProperty()
  isPrimary: boolean;

  @ApiProperty()
  branchRoles: {
    id: string;
    roleName: string;
  }[];

  @ApiProperty({ type: [BranchPermissionLite] })
  permissions: BranchPermissionLite[];
}
