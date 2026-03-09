import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HrLeaveService } from './hr-leave.service';
import {
  ApplyLeaveDto,
  ListLeavesQueryDto,
  UpdateLeaveStatusDto,
} from './employee-leave/dto/employee-leave.dto';
import { ControllerAuthGuard, RequestUser } from 'src/guard';

type RequestWithUser = { user: RequestUser };

@ApiTags('hr-leaves')
@Controller('hr/leaves')
@UseGuards(ControllerAuthGuard)
export class HrLeaveController {
  constructor(private readonly hrLeaveService: HrLeaveService) {}

  @Post('me')
  @ApiOperation({ summary: 'Apply leave for current user' })
  async applyLeave(@Req() req: RequestWithUser, @Body() dto: ApplyLeaveDto) {
    const userId = req.user.id;
    return this.hrLeaveService.applyLeave(userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'List leaves for current user' })
  async listMyLeaves(
    @Req() req: RequestWithUser,
    @Query() query: ListLeavesQueryDto,
  ) {
    const userId = req.user.id;
    return this.hrLeaveService.listForUser(userId, query);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'List leaves for a specific user' })
  async listForUser(
    @Param('userId') userId: string,
    @Query() query: ListLeavesQueryDto,
  ) {
    return this.hrLeaveService.listForUser(userId, query);
  }

  @Get('branch/:branchId')
  @ApiOperation({ summary: 'List leaves for a specific branch' })
  async listForBranch(
    @Param('branchId') branchId: string,
    @Query() query: ListLeavesQueryDto,
  ) {
    return this.hrLeaveService.listForBranch(branchId, query);
  }

  @Patch(':leaveId/status')
  @ApiOperation({ summary: 'Update leave status (approve/reject/cancel)' })
  async updateStatus(
    @Req() req: RequestWithUser,
    @Param('leaveId') leaveId: number,
    @Body() dto: UpdateLeaveStatusDto,
  ) {
    const approverId = req.user.id;

    return this.hrLeaveService.updateLeaveStatus(leaveId, dto, approverId);
  }
}
