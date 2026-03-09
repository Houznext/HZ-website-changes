import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, Length, IsOptional, IsInt, Matches, IsBoolean } from 'class-validator';

export class CreateAddressDto {

    @ApiProperty()
    @Transform(({ value }) => value.trim())
    @IsString()
    @IsNotEmpty()
    country: string;

    @ApiProperty()
    @IsString()
    // @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    label?: string;

    @ApiProperty()
    @Matches(/^[6-9]\d{9}$/, {
        message:
            'Phone number must start with 6, 7, 8, or 9, and be 10 digits long',
    })
    @IsString()
    // @IsNotEmpty()
    phone: string;


    @ApiProperty()
    @Transform(({ value }) => value.trim())
    @IsString()
    @IsNotEmpty()
    state: string;

    @ApiProperty()
    @Transform(({ value }) => value.trim())
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiProperty()
    @Transform(({ value }) => value.trim())
    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{6}$/, { message: 'Pin code must be a 6-digit number' })
    zipCode: string;

    @ApiProperty()
    @Transform(({ value }) => value.trim())
    @IsString()
    @IsOptional()
    landmark?: string;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    area: string;
}

export class UpdateAddressDto {

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    @Length(10, 15)
    phone?: string;


    @ApiProperty()
    @IsString()
    @IsOptional()
    label?: string;

    @ApiProperty()
    @Transform(({ value }) => value.trim())
    @IsString()
    @IsOptional()
    country?: string;

    @ApiProperty()
    @Transform(({ value }) => value.trim())
    @IsString()
    @IsOptional()
    state?: string;

    @ApiProperty()
    @Transform(({ value }) => value.trim())
    @IsString()
    @IsOptional()
    city?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    landmark?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    @Length(6, 6)
    zipCode?: string;

    @ApiProperty()
    @Transform(({ value }) => value.trim())
    @IsString()
    @IsOptional()
    area?: string;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}

export class AddressDto {
    id: string;
    country: string;
    name: string;
    phone: string;
    landmark: string;
    state: string;
    city: string;
    zipCode: string;
    area: string;
    isDefault: boolean
}


