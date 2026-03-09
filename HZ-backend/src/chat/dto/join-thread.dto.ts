import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class JoinThreadDto {
  @IsIn(['dm', 'channel'])
  kind: 'dm' | 'channel';

  @IsString()
  @IsNotEmpty()
  id: string;
}
