import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  IsOptional,
  IsNumber,
  IsEmail
} from 'class-validator';
import { ServiceCategory  } from 'src/crm/enums/crm.enum';
export class CreateReferralDto {
  @ApiProperty({ example: 1, description: 'ID of the referrer (user making the referral)' })
  @IsString()
  @IsNotEmpty()
  referrerId: string;

  @ApiProperty({ example: 'John Doe', description: 'Name of the referred friend', required: false })
  @IsOptional()
  @IsString()
  friendName?: string;

  @ApiProperty({ example: '9876543210', description: 'Phone number of the referred friend', required: false })
  @IsOptional()
  @Matches(/^[6-9]\d{9}$/, {
    message:
      'Phone number must start with 6, 7, 8, or 9, and be 10 digits long',
  })
  friendPhone?: string;

  @ApiProperty({ example: 'friend@example.com', description: 'Email of the referred friend', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  friendEmail?: string;

  @ApiProperty({ example: 'Hyderabad', description: 'City of the referred friend', required: false })
  @IsOptional()
  @IsString()
  friendCity?: string;
  @ApiProperty()
  @IsEnum(ServiceCategory)
  @IsNotEmpty()
category:ServiceCategory
}
