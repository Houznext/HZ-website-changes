import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class ReadThreadDto {
  @IsIn(['dm', 'channel'])
  threadKind: 'dm' | 'channel';

  @IsString()
  @IsNotEmpty()
  threadId: string;
}
