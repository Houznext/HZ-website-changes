import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { AttendanceRequestType, AttendanceRequestStatus } from '../entities/attendance-request.entity';

export class CreateAttendanceRequestDto {
  @ApiProperty({ example: '2026-02-03' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string;

  @ApiProperty({ enum: AttendanceRequestType })
  @IsEnum(AttendanceRequestType)
  type: AttendanceRequestType;

  @ApiPropertyOptional({ example: '09:30' })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/)
  requestedClockInTime?: string;

  @ApiPropertyOptional({ example: '18:30' })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/)
  requestedClockOutTime?: string;

  @ApiPropertyOptional({ example: 'Forgot punch due to meeting' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: 'Called 40 leads, closed 2 deals...' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  workLog?: string;

  @ApiPropertyOptional({ example: 'Office - Kukatpally' })
  @IsOptional()
  @IsString()
  location?: string;
}

export class ReviewAttendanceRequestDto {
  @ApiProperty({ enum: AttendanceRequestStatus, example: 'APPROVED' })
  @IsEnum(AttendanceRequestStatus)
  status: AttendanceRequestStatus; // APPROVED or REJECTED

  @ApiPropertyOptional({ example: 'Ok approved' })
  @IsOptional()
  @IsString()
  actionNotes?: string;
}
