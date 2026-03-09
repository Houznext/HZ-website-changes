import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Matches,
  IsBoolean,
  IsNumber,
  IsOptional
} from 'class-validator';

export class CreateContactSellerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @Matches(/^[6-9]\d{9}$/, {
    message:
      'Phone number must start with 6, 7, 8, or 9, and be 10 digits long',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsBoolean()
  agreeToContact: boolean;

  @ApiProperty()
  @IsBoolean()
  interestedInLoan: boolean;

  @ApiProperty()
  @IsString()
  propertyId: string;
   @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isProject?: boolean;
}
