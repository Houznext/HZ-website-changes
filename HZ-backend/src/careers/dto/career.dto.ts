import { ApiProperty } from "@nestjs/swagger";
import { JobType } from "../enum/jobType.enum";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCareerDto {
  @ApiProperty()
  @IsString()
  jobTitle: string;

  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsNumber()
  openings: number;

  @ApiProperty()
  @IsString()
  jobDescription: string;

  @ApiProperty()
  @IsNumber()
  jobDepartmentId: number;

  @ApiProperty()
  @IsNumber()
  jobRoleId: number;

  @ApiProperty()
  @IsString()
  experience: string;

  @ApiProperty()
  @IsArray()
  skills: string[];

  @ApiProperty()
  @IsString()
  qualification: string;

  @ApiProperty()
  @IsEnum(JobType)
  jobType: JobType;

  @ApiProperty()
  @IsOptional()
  @IsString()
  jobHighlights: string;

}

export class CareerResponseDto {
  id: number;
  jobTitle: string;
  location: string;
  posted: Date;
  openings: number;
  jobDescription: string;
  experience: string;
  skills: string[];
  qualification: string;
  jobType: string;
  jobHighlights: string | null;
  createdAt: Date;
  updatedAt: Date;
  jobDepartment: {
    id: number;
    name: string;
    description: string;
  };
  jobRole: {
    id: number;
    title: string;
    description: string;
  };
}

export class CreateJobDepartmentDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description: string;
}

export class CreateJobRoleDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  jobDepartmentId: number;
}

export class UpdateCareerDto {

  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  openings?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  jobDescription?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  jobDepartmentId?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  jobRoleId?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  experience?: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  skills?: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  qualification?: string;

  @ApiProperty()
  @IsEnum(JobType)
  @IsOptional()
  jobType?: JobType;

  @ApiProperty()
  @IsOptional()
  @IsString()
  jobHighlights?: string;

}

export class DepartmentResponseDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description: string;
}

export class RoleResponseDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description: string;

}