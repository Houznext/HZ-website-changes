import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";


export class WhatsAppDto
{
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    phone: string;
}