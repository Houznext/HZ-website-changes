import { Type } from 'class-transformer';
import { IsNotEmpty, IsEmail, IsArray, IsOptional, IsString, ValidateNested, IsNumber } from 'class-validator';

import { IsEnum } from 'class-validator';
import { ApplicationStatus } from '../enum/applicationStatus.enum';

export class UpdateStatusDto {
  @IsEnum(ApplicationStatus, {
    message: `Status must be one of the following: ${Object.values(ApplicationStatus).join(', ')}`,
  })
  status: ApplicationStatus;
}

class QualificationDto {
    @IsNotEmpty()
    @IsString()
    degree: string;
  
    @IsNotEmpty()
    @IsString()
    institution: string;
  
    @IsNotEmpty()
    @IsString()
    yearOfCompletion: string;
  }
  
  class WorkExperienceDto {
    @IsNotEmpty()
    @IsString()
    company: string;
  
    @IsNotEmpty()
    @IsString()
    role: string;
  
    @IsNotEmpty()
    @IsString()
    duration: string;
  
    @IsOptional()
    @IsString()
    description: string;
  }
  
  export class ApplyCareerDto {
    @IsNotEmpty()
    @IsString()
    name: string;
  
    @IsNotEmpty()
    @IsEmail()
    email: string;
  
    @IsOptional()
    @IsNumber()
    phone: string;
  
    @IsOptional()
    @IsString()
    address: string;
  
    @IsOptional()
    @IsString()
    linkedin: string;
  
    @IsOptional()
    @IsString()
    github: string;
  
    @IsOptional()
    @IsString()
    resume: string; // URL or file path to resume
  
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QualificationDto)
    qualifications: QualificationDto[];
  
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WorkExperienceDto)
    workExperience: WorkExperienceDto[];
  }