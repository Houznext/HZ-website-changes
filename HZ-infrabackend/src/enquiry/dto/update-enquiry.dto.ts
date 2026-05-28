import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ENQUIRY_STATUS_VALUES } from '../enquiry-status.constants';

export class UpdateEnquiryDto {
  @IsOptional()
  @IsIn([...ENQUIRY_STATUS_VALUES])
  status?: string;

  /** New team response note (appended with timestamp). */
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  responseNote?: string;
}
