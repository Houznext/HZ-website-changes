import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateSnagDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  raisedBy: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'critical'])
  severity?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsString()
  tradeId: string;

  @IsString()
  projectId: string;
}

export class ResolveSnagDto {
  @IsString()
  resolvedBy: string;

  @IsString()
  note: string;
}
