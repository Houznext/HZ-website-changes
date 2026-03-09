import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { StaffAttendanceStatus } from '../entities/attendance-record.entity';

export class StaffClockInDto {
  @ApiPropertyOptional({ example: '2026-02-02' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;

  @ApiPropertyOptional({ example: '09:30' })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/)
  clockInTime?: string;

  @ApiPropertyOptional({ example: 'Office - Kukatpally' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'Reached on time' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class StaffClockOutDto {
  @ApiPropertyOptional({ example: '18:30' })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/)
  clockOutTime?: string;

  @ApiPropertyOptional({ example: 'Office - Kukatpally' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'Done for the day' })
  @IsOptional()
  @IsString()
  notes?: string;
  @ApiProperty({ example: 'Called 40 leads, closed 2 deals, updated CRM notes.' })
  @IsString()
  @MinLength(5, { message: 'workLog must be at least 5 characters' })
  workLog: string;
}

export class StaffApproveAttendanceDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsString()
  status: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({ example: 'Approved by HR' })
  @IsOptional()
  @IsString()
  approvalNotes?: string;
}

export class StaffManualAttendanceDto {
  @ApiProperty({ example: 'uuid-of-staff-user' })
  @IsString()
  userId: string;

  @ApiProperty({ example: '2026-02-02' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string;

  @ApiProperty({ example: '09:30' })
  @IsOptional()
  // @Matches(/^\d{2}:\d{2}$/)
  clockInTime: string;

  @ApiProperty({ example: '18:30' })
  @IsOptional()
  // @Matches(/^\d{2}:\d{2}$/)
  clockOutTime: string;

  @ApiPropertyOptional({ example: 'Manual entry' })
  @IsOptional()
  @IsString()
  notes?: string;
   @IsOptional()
  @IsString()
  workLog?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'Asia/Kolkata' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ enum: StaffAttendanceStatus })
  @IsOptional()
  @IsEnum(StaffAttendanceStatus)
  status?: StaffAttendanceStatus;
  @IsOptional()
@IsString()
requestId?: string;

}
