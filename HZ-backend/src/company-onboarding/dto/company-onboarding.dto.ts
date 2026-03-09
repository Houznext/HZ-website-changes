import {
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsEmail,
  Matches,
  IsIn,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { AllowedUnits } from '../Interfaces/size.interface';
import { propertyTypeEnum } from '../Enum/company.enum';

export class SizeWithUnitDto {
  @ApiProperty({ example: 1200 })
  @IsNumber()
  size: number;

  @ApiProperty({
    example: 'sq.ft',
    enum: ['sq.ft', 'sq.yard', 'sq.meter', 'acre', 'cent', 'marla'],
  })
  @IsString()
  @IsIn(['sq.ft', 'sq.yard', 'sq.meter', 'acre', 'cent', 'marla', 'unit'])
  unit: AllowedUnits;
}

export class DeveloperInformationDto {
  @ApiProperty()
  @IsString()
  Name: string;

  @ApiProperty()
  @IsString()
  PhoneNumber: string;

  @ApiProperty()
  @IsString()
  whatsappNumber: string;

  @ApiProperty()
  @IsString()
  officialEmail: string;
}

export class AwardsDto {
  @ApiProperty({ description: 'Title of the award' })
  @IsString()
  @IsNotEmpty()
  awardTitle: string;

  @ApiProperty({ description: 'Category of the award' })
  @IsString()
  @IsNotEmpty()
  awardCategory: string;

  @ApiProperty({ description: 'Name of the issuing organization' })
  @IsString()
  @IsNotEmpty()
  issuingOrganization: string;

  @ApiProperty({ description: 'Year the award was received' })
  @IsNumber()
  @IsNotEmpty()
  yearReceived: number;

  @ApiProperty({ description: 'Description of the award' })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class AddressDto {
  @ApiProperty({ example: 'Hyderabad' })
  @IsOptional()
  @IsString()
  city: string;

  @ApiProperty({ example: 'Telangana', required: false })
  @IsString()
  state: string;

  @ApiProperty({ example: 'Madhapur' })
  @IsString()
  locality: string;

  @ApiProperty({ example: 'Ayyapa Society', required: false })
  @IsString()
  subLocality: string;

  @ApiProperty({ example: 'Sri Krishna Temple', required: false })
  @IsOptional()
  @IsString()
  landmark?: string;

  @ApiProperty({ example: '17.3850', required: false })
  @IsOptional()
  @IsString()
  latitude: string;

  @ApiProperty({ example: '78.4867', required: false })
  @IsOptional()
  @IsString()
  longitude: string;

  @ApiProperty({ example: 'ChIJN1t_tDeuEmsRUsoyG83frY4', required: false })
  @IsOptional()
  @IsString()
  place_id: string;

  @ApiProperty({ example: '123 Main St' })
  @IsOptional()
  @IsString()
  street: string;

  @ApiProperty({ example: 'India' })
  @IsOptional()
  @IsString()
  country: string;

  @ApiProperty({ example: '500081', required: false })
  @IsString()
  zipCode: string;
}

export class CompanyDto {
  @ApiProperty()
  @IsString()
  companyName: string;

  @ApiProperty()
  @IsString()
  RERAId: string;

  @ApiProperty()
  @IsNumber()
  estdYear: number;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  Logo: string[];

  @ApiProperty()
  @IsString()
  about: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => DeveloperInformationDto)
  developerInformation: DeveloperInformationDto;
}
export class UpdateCompanyDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  RERAId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  estdYear?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  Logo?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => DeveloperInformationDto)
  developerInformation?: DeveloperInformationDto;
}

export class LocationDto {
  @ApiProperty({ example: 'Hyderabad' })
  @IsOptional()
  @IsString()
  city: string;

  @ApiProperty({ example: 'Telangana' })
  @IsString()
  state: string;

  @ApiProperty({ example: 'Madhapur' })
  @IsString()
  locality: string;

  @ApiProperty({ example: 'Ayyapa Society', required: false })
  @IsString()
  subLocality: string;

  @ApiProperty({ example: 'Sri Krishna Temple', required: false })
  @IsOptional()
  @IsString()
  landmark?: string;

  @ApiProperty({ example: '17.3850' })
  @IsString()
  latitude: string;

  @ApiProperty({ example: '78.4867' })
  @IsString()
  longitude: string;

  @ApiProperty({ example: 'ChIJN1t_tDeuEmsRUsoyG83frY4' })
  @IsString()
  place_id: string;

  @ApiProperty({ example: '123 Main St' })
  @IsOptional()
  @IsString()
  street: string;

  @ApiProperty({ example: 'India' })
  @IsOptional()
  @IsString()
  country: string;

  @ApiProperty({ example: '500081', required: false })
  @IsString()
  zipCode: string;
}

class MediaDetailsDto {
  @ApiProperty()
  @IsOptional()
  @IsString({ each: true })
  propertyImages: string[];

  @ApiProperty()
  @IsOptional()
  @IsString({ each: true })
  propertyVideo: string[];
}
class ConstructionDetailsDto {
  @ApiProperty()
  @IsOptional()
  @IsEnum(['Ready to Move', 'Under Construction', 'Newly Launched'])
  status: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  ageOfProperty?: number; // Required if status is 'Ready to Move'

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  possessionYears?: number; // Required if status is 'Under Construction' or 'Newly Launched'

  @ApiProperty()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  possessionBy?: Date;
  @ApiProperty() 
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  launchedDate?: Date;
}

export class FlooringPlansDto {
  @ApiProperty({
    required: false,
    description: 'Unique identifier for the flooring plan',
  })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({
    required: false,
    description: 'Identifier or name of the floor plan',
  })
  // @IsArray()
  @IsString({ each: true })
  @IsOptional()
  floorplan: string[];

  @ApiProperty({
    type: SizeWithUnitDto,
    description: 'Built-up area with its size and unit details',
  })
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  BuiltupArea: SizeWithUnitDto;

  @ApiProperty({
    required: false,
    description: 'Total price of the floor plan',
  })
  @IsNumber()
  @IsOptional()
  TotalPrice: number;

  @ApiProperty({ required: false, description: 'Price per square foot' })
  @IsNumber()
  @IsOptional()
  pricePerSft: number;

  @ApiProperty({
    required: false,
    description: 'Starting EMI amount for the floor plan',
  })
  @IsNumber()
  @IsOptional()
  emiStartsAt?: number;

  @ApiProperty({
    required: false,
    description: 'URL for associated blueprint or media file',
  })
  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @ApiProperty({
    required: false,
    description: 'Additional description or remarks about the floor plan',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    required: false,
    description: 'Status of the floor plan (e.g., active, archived)',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({
    required: false,
    description: 'Floor number in the building, if applicable',
  })
  @IsNumber()
  @IsOptional()
  floorNumber?: number;

  @ApiProperty({
    required: false,
    description: 'Timestamp when the floor plan was created',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  createdAt?: Date;

  @ApiProperty({
    required: false,
    description: 'Timestamp when the floor plan was last updated',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  updatedAt?: Date;
}

export class UnitsDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  unitName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  BHK?: string;

  @ApiProperty({ type: SizeWithUnitDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  flatSize?: SizeWithUnitDto;

  @ApiProperty({ type: SizeWithUnitDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  plotSize?: SizeWithUnitDto;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => FlooringPlansDto)
  flooringPlans: FlooringPlansDto[];
}

export class PropertyTypeDto {
  @ApiProperty({ enum: propertyTypeEnum })
  @IsEnum(propertyTypeEnum)
  typeName: propertyTypeEnum;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ValidateNested({ each: true })
  @Type(() => UnitsDto)
  units: UnitsDto[];
}

export class ProjectDto {
  @ApiProperty()
  @IsString()
  Name: string;

  @ApiProperty()
  @IsString()
  Description: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  isBrokerage?: boolean;

  @ApiProperty()
   @IsOptional()
  Highlights: string;

  @ApiProperty({ type: SizeWithUnitDto })
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  ProjectArea: SizeWithUnitDto;

  @ApiProperty({ type: SizeWithUnitDto })
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  ProjectSize: SizeWithUnitDto;

  @ApiProperty({ type: SizeWithUnitDto, required: false })
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  MinSize: SizeWithUnitDto;

  @ApiProperty({ type: SizeWithUnitDto, required: false })
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  MaxSize: SizeWithUnitDto;

  @ApiProperty()
   @IsOptional()
  Specifications: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  Brochure: string[];

  @ApiProperty()
  @IsString()
  AboutProject: string;
   @IsNumber()
  minPrice: number;

  @IsNumber()
  maxPrice: number;

  @ApiProperty()
  // @IsArray()
  @IsOptional()
  ProjectAmenities: string[];

  @ApiProperty()
  @IsArray()
  faqs: {
    question: string;
    answer: string;
  }[];

  @ApiProperty()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => MediaDetailsDto)
  mediaDetails: MediaDetailsDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => ConstructionDetailsDto)
  constructionStatus: ConstructionDetailsDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PropertyTypeDto)
  propertyType: PropertyTypeDto;
}

export class SellerDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  role: string;

  @ApiProperty()
  @IsString()
  priceRange: string;

  @ApiProperty()
  @IsString()
  contactEmail: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  profilePhoto?: string;
}

export class VerifySellerEmailDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  projectId: string;
}

export class verifySellerOtpDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  otp: string;

  @ApiProperty()
  @IsString()
  projectId: string;
}

export class SaveSellerDetailsDto {
  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @Transform(({ value }) => value.trim())
  @Matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/, {
    message:
      'First name should only contain letters and spaces between words, with no spaces at the start or end',
  })
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @Transform(({ value }) => value.trim())
  @Matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/, {
    message:
      'Last name should only contain letters and spaces between words, with no spaces at the start or end',
  })
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail({}, { message: 'A valid email is required' })
  email: string;

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

  @ApiProperty()
  @IsString()
  @IsOptional()
  profilePhoto?: string;

  @ApiProperty()
  @IsString()
  priceRange: string;
}

export class updateSellerDetailsDto {
  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @Transform(({ value }) => value.trim())
  @Matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/, {
    message:
      'First name should only contain letters and spaces between words, with no spaces at the start or end',
  })
  firstName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @Transform(({ value }) => value.trim())
  @Matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/, {
    message:
      'Last name should only contain letters and spaces between words, with no spaces at the start or end',
  })
  lastName?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail({}, { message: 'A valid email is required' })
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[6-9]\d{9}$/, {
    message:
      'Phone number must start with 6, 7, 8, or 9, and be 10 digits long',
  })
  phone?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  profilePhoto?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  priceRange?: string;
}

export class DeleteSellerDto {
  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;
}

export class VerifyDeveloperEmailDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;
}

export class verifyDeveloperOtpDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  otp: string;
}

export class UpdateProjectDto extends PartialType(ProjectDto) {
  @ApiProperty({ type: CompanyDto })
  @ValidateNested()
  @Type(() => CompanyDto)
  company: CompanyDto;
}
