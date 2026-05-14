import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateInfraUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  kind?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString({ each: true })
  @IsOptional()
  states?: string[];
}

export class InfraUserListQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
