import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  IsNumber,
  IsEnum
} from 'class-validator';
import { ServiceCategory, LeadStatus } from 'src/crm/enums/crm.enum';
export class CreateContactUsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;
  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  @Length(10, 15)
  contactNumber: string;
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  emailAddress: string;
  @ApiProperty({
    example: 'Looking for interior design services',
    required: false,
  })
  @IsOptional()
  @IsString()
  tellUsMore?: string;

  @ApiProperty({ example: 'Real Estate', required: false })
  @IsOptional()
  @IsString()
  serviceType?: string;

  @ApiProperty({ example: 'Hyderabad', required: false })
  @IsOptional()
  @IsString()
  city?: string;
}
export class UpdateContactUsDto extends PartialType(CreateContactUsDto) {
  
}
