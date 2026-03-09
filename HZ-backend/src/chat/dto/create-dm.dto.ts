import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateDmDto {
  @IsUUID()
  @IsNotEmpty()
  otherUserId: string;
}
