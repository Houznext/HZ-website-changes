import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateConversationDto {
  @ApiPropertyOptional({ description: 'Anonymous session id (e.g. from cookie)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sessionId?: string;
}
