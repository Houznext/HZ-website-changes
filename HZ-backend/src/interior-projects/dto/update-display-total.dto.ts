import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateDisplayTotalDto {
  /** Pass null to reset to the actual project count. */
  @IsOptional()
  @IsInt()
  @Min(0)
  displayTotalProjects?: number | null;
}
