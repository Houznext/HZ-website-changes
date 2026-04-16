import {
  IsOptional,
  IsBoolean,
  IsNumber,
  IsString,
} from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsNumber()
  intervalMs?: number;

  @IsOptional()
  @IsString()
  transition?: string;

  @IsOptional()
  @IsBoolean()
  showArrows?: boolean;

  @IsOptional()
  @IsBoolean()
  showDots?: boolean;

  @IsOptional()
  @IsBoolean()
  pauseOnHover?: boolean;

  @IsOptional()
  @IsBoolean()
  kenBurns?: boolean;
}
