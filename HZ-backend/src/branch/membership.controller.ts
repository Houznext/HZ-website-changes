import {
  Controller, Post, Body, Param, ParseIntPipe, Get, Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserBranchMembership } from './entities/user-branch-membership.entity';
import { AssignUserToBranchDto, SwitchBranchDto } from './dto/branch.dto';
import { MembershipService } from './membership.service';

class SwitchResponse {
  message: string;
  branchId: string;
}
class MessageResponse {
  message: string;
}

@ApiTags('Branch Memberships')
@Controller('branches')
export class MembershipController {
  constructor(private membershipService: MembershipService) {}

  @Post('assign')
  @ApiOperation({ summary: 'Assign user to a branch with branch-roles' })
  @ApiResponse({ status: 201, type: UserBranchMembership })
  assign(@Body() dto: AssignUserToBranchDto) {
    return this.membershipService.assign(dto);
  }

  @Get(':branchId/members')
  @ApiOperation({ summary: 'List members of a branch' })
  @ApiResponse({ status: 200, type: UserBranchMembership, isArray: true })
  list(@Param('branchId', ParseIntPipe) branchId: string) {
    return this.membershipService.listMembers(branchId);
  }

  @Post('switch/:userId')
  @ApiOperation({ summary: 'Switch the current branch for a user' })
  @ApiResponse({ status: 200, type: SwitchResponse })
  switchBranch(
    @Param('userId', ParseIntPipe) userId: string,
    @Body() dto: SwitchBranchDto,
  ) {
    return this.membershipService.switchBranch(userId, dto);
  }

  @Delete(':branchId/members/:userId')
  @ApiOperation({ summary: 'Remove a user from a branch' })
  @ApiResponse({ status: 200, type: MessageResponse })
  async remove(
    @Param('userId', ParseIntPipe) userId: string,
    @Param('branchId', ParseIntPipe) branchId: string,
  ) {
    await this.membershipService.remove(userId, branchId);
    return { message: 'Removed' };
  }
}
