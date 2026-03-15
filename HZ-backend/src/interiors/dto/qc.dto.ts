import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateQcItemDto {
  @IsOptional()
  @IsIn(['pending', 'pass', 'fail', 'skipped'])
  status?: string;

  @IsOptional()
  @IsString()
  checkedBy?: string;

  @IsOptional()
  @IsString()
  failureNote?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}
