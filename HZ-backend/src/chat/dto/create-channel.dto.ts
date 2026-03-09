import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ArrayMinSize,
  MaxLength,
} from "class-validator";

export class CreateChannelDto {
  @ApiProperty({
    example: "Sales Team",
    description: "Channel name",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({
    example: "Internal discussions and updates for the sales team",
    description: "Optional channel description",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string; // ✅ NEW

  @ApiProperty({
    example: ["uuid1", "uuid2"],
    description: "User IDs to be added as channel members",
  })
  @IsArray()
  @ArrayMinSize(2) // creator + at least 1 more
  @IsUUID("4", { each: true })
  memberIds: string[];
}
