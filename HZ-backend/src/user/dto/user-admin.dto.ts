import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserKind, UserRole } from "../enum/user.enum";
import { IsEnum, IsIn, IsInt, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class GetAdminUsersOverviewFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by branch ID',
  })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiPropertyOptional({
    enum: UserKind,
    description: 'Filter users by kind',
  })
  @IsOptional()
  @IsEnum(UserKind)
  kind?: UserKind;

  @ApiPropertyOptional({
    description: 'Search by name, email, or phone',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['createdAt', 'firstName', 'totalOrders', 'totalSpent'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'firstName', 'totalOrders', 'totalSpent'])
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}


export class UserOverviewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  profile: string | null;

  @ApiProperty({ enum: UserKind })
  kind: UserKind;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  branchName: string | null;

  @ApiProperty()
  branchId: string | null;

  @ApiProperty({ type: [String] })
  branchRoles: string[];

  // Statistics
  @ApiProperty()
  totalProperties: number;

  @ApiProperty()
  totalOrders: number;

  @ApiProperty()
  totalSpent: number;

  @ApiProperty()
  wishlistCount: number;

  @ApiProperty()
  customBuilderCount: number;

  @ApiProperty()
  crmLeadCount: number;
}

export class UserOverviewResponseDto {
  @ApiProperty({ type: [UserOverviewDto] })
  users: UserOverviewDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}