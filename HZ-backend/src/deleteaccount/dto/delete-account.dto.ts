import { ApiProperty } from "@nestjs/swagger";
import { IsEmpty, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class DeleteAccountDto {
    @ApiProperty()
    @IsString()
    reason: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description: string;
}