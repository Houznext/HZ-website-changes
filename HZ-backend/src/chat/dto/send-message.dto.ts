import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateAttachmentDto } from './create-attachment.dto';

export class SendMessageDto {
  @IsIn(['dm', 'channel'])
  threadKind: 'dm' | 'channel';

  @IsString()
  @IsNotEmpty()
  threadId: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  attachments?: CreateAttachmentDto[];

  @IsOptional()
  isImportant?: boolean;
}
