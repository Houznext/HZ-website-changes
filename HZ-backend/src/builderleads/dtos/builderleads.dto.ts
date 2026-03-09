import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsNumber, IsNotEmpty, Matches, } from 'class-validator';

export class CreateBuilderLeadDto {

    @ApiProperty({ required: true })
    @IsString()
    @Transform(({ value }) => value.trim())
    @IsNotEmpty({ message: 'Phone number is required' })
    @Matches(/^[6-9]\d{9}$/, {
      message:
        'Phone number must start with 6, 7, 8, or 9, and be 10 digits long',
    })
    phoneNumber: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @Transform(({ value }) => value.trim())
    @IsString()
    @Matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/, {
        message:
          'Name should only contain letters and spaces between words',
      })
    name: string;

    @ApiProperty({ required: true })
    @IsString()
    searchLocation: string;

    @ApiProperty({ required: true })
    @IsNumber()
    houseBuiltUpArea: number;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    balconyUtilityArea: number;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    noOfCarParking: number;
}
