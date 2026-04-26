import { IsString, IsNotEmpty } from 'class-validator';

export class UpsertCmsDto {
  @IsString()
  @IsNotEmpty()
  key: string;
  @IsString()
  @IsNotEmpty()
  data: string;
}
