import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class DeleteChatHistoryDto {
  @ApiProperty({ type: [String], description: 'Array of message UUIDs to delete' })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  ids: string[];
}
