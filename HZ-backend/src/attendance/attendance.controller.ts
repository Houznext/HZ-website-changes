import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ControllerAuthGuard } from 'src/guard';

import { StaffAttendanceService } from './attendance.service';
import {
  StaffApproveAttendanceDto,
  StaffClockInDto,
  StaffClockOutDto,
  StaffManualAttendanceDto,
} from './dto/attendance.dto';
import { StaffAttendanceStatus } from './entities/attendance-record.entity';
import { CreateAttendanceRequestDto, ReviewAttendanceRequestDto } from './dto/attendance-request.dto';
import { AttendanceRequestStatus } from './entities/attendance-request.entity';

@ApiTags('Staff Attendance')
@ApiBearerAuth()
@Controller('staff-attendance')
@UseGuards(ControllerAuthGuard)
export class StaffAttendanceController {
  constructor(private readonly service: StaffAttendanceService) {}

  private uid(req: any) {
    return req.user?.sub || req.user?.id;
  }

  // ------------------ Staff self endpoints ------------------

  @ApiOperation({ summary: 'STAFF clock-in (IST)' })
  @Post('clock-in')
  clockIn(@Body() dto: StaffClockInDto, @Request() req) {
    return this.service.clockIn(this.uid(req), dto);
  }

  @ApiOperation({ summary: 'STAFF clock-out (IST)' })
  @Post('clock-out')
  clockOut(@Body() dto: StaffClockOutDto, @Request() req) {
    return this.service.clockOut(this.uid(req), dto);
  }

  @ApiOperation({ summary: 'Today status for current STAFF user' })
  @Get('today-status')
  todayStatus(@Request() req) {
    return this.service.todayStatus(this.uid(req));
  }

  @ApiOperation({ summary: 'My attendance history' })
  @ApiQuery({ name: 'from', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'to', required: false, description: 'YYYY-MM-DD' })
  @Get('my')
  myHistory(@Request() req, @Query('from') from?: string, @Query('to') to?: string) {
    return this.service.myHistory(this.uid(req), from, to);
  }

  // ------------------ Admin/HR endpoints ------------------

  @ApiOperation({ summary: 'List staff attendance (branch aware)' })
  @ApiQuery({ name: 'branchId', required: false, description: 'ORG SuperAdmin only' })
  @ApiQuery({ name: 'from', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'to', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'status', required: false, enum: StaffAttendanceStatus })
  @Get('all')
  all(
    @Request() req,
    @Query('branchId') branchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: StaffAttendanceStatus,
  ) {
    return this.service.listAllBranchWise(req.user, branchId, from, to, status);
  }
   @ApiOperation({ summary: 'Get attendance history for a specific user (Admin/HR)' })
@ApiQuery({ name: 'from', required: false, description: 'YYYY-MM-DD' })
@ApiQuery({ name: 'to', required: false, description: 'YYYY-MM-DD' })
@Get('by-user/:userId')
byUser(
  @Param('userId') userId: string,
  @Query('from') from?: string,
  @Query('to') to?: string,
) {
  return this.service.historyByUser(userId, from, to);
}

  @ApiOperation({ summary: 'Approve/Reject attendance (branch aware)' })
  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body() dto: StaffApproveAttendanceDto, @Request() req) {
    return this.service.approve(id, this.uid(req), req.user, dto);
  }

  @ApiOperation({ summary: 'Create/update manual attendance record (Admin/HR)' })
  @Post('manual')
  manualUpsert(@Body() dto: StaffManualAttendanceDto, @Request() req) {
    return this.service.manualUpsert(this.uid(req), req.user, dto);
  }

  @ApiOperation({ summary: 'ADMIN/HR: list attendance requests (branch aware)' })
  @ApiQuery({ name: 'branchId', required: false, description: 'ORG SuperAdmin only' })
  @ApiQuery({ name: 'status', required: false, enum: AttendanceRequestStatus })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @Get('requests')
  listRequests(
    @Request() req,
    @Query('branchId') branchId?: string,
    @Query('status') status?: AttendanceRequestStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.listRequestsBranchWise(req.user, branchId, status, from, to);
  }

  @ApiOperation({ summary: 'ADMIN/HR: approve attendance request and apply to attendance record (branch aware)' })
  @Patch('requests/:id/approve')
  approveRequest(@Param('id') id: string, @Body() dto: ReviewAttendanceRequestDto, @Request() req) {
    return this.service.approveRequest(id, this.uid(req), req.user, dto);
  }

  @ApiOperation({ summary: 'ADMIN/HR: reject attendance request (branch aware)' })
  @Patch('requests/:id/reject')
  rejectRequest(@Param('id') id: string, @Body() dto: ReviewAttendanceRequestDto, @Request() req) {
    return this.service.rejectRequest(id, this.uid(req), req.user, dto);
  }

  @ApiOperation({ summary: 'STAFF: my attendance requests' })
  @Get('requests/my')
  myRequests(@Request() req) {
    return this.service.listMyRequests(this.uid(req));
  }

  @ApiOperation({ summary: 'STAFF: request manual attendance (forgot punch)' })
  @Post('requests')
  createRequest(@Body() dto: CreateAttendanceRequestDto, @Request() req) {
    return this.service.createRequest(this.uid(req), dto);
  }
}
