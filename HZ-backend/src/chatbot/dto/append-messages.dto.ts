import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum BotMessageRoleEnum {
  user = 'user',
  assistant = 'assistant',
}

export class BotMessageItemDto {
  @ApiProperty({ enum: BotMessageRoleEnum })
  @IsEnum(BotMessageRoleEnum)
  role: 'user' | 'assistant';

  @ApiProperty()
  @IsString()
  content: string;
}

export class AppendMessagesDto {
  @ApiProperty({ type: [BotMessageItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BotMessageItemDto)
  messages: BotMessageItemDto[];
}
