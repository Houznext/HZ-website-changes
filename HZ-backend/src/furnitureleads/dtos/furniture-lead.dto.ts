import { IsString, IsEmail, IsNotEmpty, IsPhoneNumber, ValidateNested, IsObject, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class RoomsDto {
    @ApiProperty({ description: 'Number of living rooms' })
    @IsNotEmpty()
    @Type(() => Number)
    livingRoom: number;

    @ApiProperty({ description: 'Number of kitchens' })
    @IsNotEmpty()
    @Type(() => Number)
    kitchen: number;

    @ApiProperty({ description: 'Number of bedrooms' })
    @IsNotEmpty()
    @Type(() => Number)
    bedroom: number;

    @ApiProperty({ description: 'Number of bathrooms' })
    @IsNotEmpty()
    @Type(() => Number)
    bathroom: number;

    @ApiProperty({ description: 'Number of dining rooms', required: false })
    @Type(() => Number)
    dining: number;
}

export class createFurnitureLeadsDto {

    @ApiProperty({ description: 'Type of BHK', example: '1bhk' })
    @IsString()
    @IsNotEmpty()
    bhkType: string;

    @ApiProperty({ type: RoomsDto, description: 'Details of rooms' })
    @ValidateNested()
    @Type(() => RoomsDto)
    rooms: RoomsDto;

    @ApiProperty({ description: 'Package selected', example: 'Essentials' })
    @IsString()
    @IsNotEmpty()
    package: string;

    @ApiProperty({ description: 'Full name of the user' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Email address of the user' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Phone number of the user' })
    @IsString()
    phone: string;

    @ApiProperty({ description: 'Name of the property' })
    @IsString()
    @IsNotEmpty()
    propertyName: string;
}
