import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class RegisterCustomerDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;
}

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
