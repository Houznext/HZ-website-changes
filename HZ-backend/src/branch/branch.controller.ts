import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  BranchWithIdDto,
  CreateBranchDto,
  UpdateBranchDto,
} from './dto/branch.dto';
import { BranchService } from './branch.service';
import { Branch } from './entities/branch.entity';
import { ControllerAuthGuard } from 'src/guard';
import {
  VerifyCustomerOtpDto,
  VerifyEmailDto,
} from 'src/Custombuilder/customer/dto/customer.dto';

class MessageResponse {
  message: string;
}

type RequestUser = {
  id: string;
  email: string;
  fullName?: string;
  activeBranchId?: string;
  branchMembership?: {
    branchId: string;
    branchRoles: {
      id: number;
      roleName: string;
    }[];
    kind: string;
    isBranchHead: boolean;
    isPrimary: boolean;
  };
  roles: any[];
};

@ApiTags('Branches')
@Controller('branches')
// @UseGuards(ControllerAuthGuard)
export class BranchController {
  constructor(private branchService: BranchService) {}

  @Get()
  @ApiOperation({ summary: 'List branches visible to current user' })
  @ApiResponse({ status: 200, type: Branch, isArray: true })
  findAll(@Req() req: { user: RequestUser }) {
    return this.branchService.findAllForUser(req.user);
  }

  @Get('/idwithname')
  @ApiOperation({ summary: 'List all branches with their id and name' })
  @ApiResponse({ status: 200, type: Branch, isArray: true })
  async getBrancheIdwithName(): Promise<BranchWithIdDto[]> {
    return this.branchService.getBrancheIdwithName();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a branch by id' })
  @ApiResponse({ status: 200, type: Branch })
  findOne(@Param('id') id: string) {
    return this.branchService.findOne(id);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'List direct children of a branch' })
  @ApiResponse({ status: 200, type: Branch, isArray: true })
  children(@Param('id') id: string) {
    return this.branchService.childrenOf(id);
  }

  @Post()
  @ApiOperation({
    summary:
      'Create a new branch; optionally attach an OTP-verified STAFF owner with default category-based permissions.',
  })
  @ApiResponse({ status: 201, description: 'Branch created', type: Branch })
  create(@Req() req: { user: RequestUser }, @Body() dto: CreateBranchDto) {
    return this.branchService.create(dto, req.user);
  }

  @Post('staff/verify-email')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Send OTP to staff email/phone before attaching to branch',
  })
  async verifyStaffEmail(@Body() data: VerifyEmailDto) {
    return this.branchService.verifyStaffEmail(data);
  }

  @Post('staff/verify-otp')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Verify staff OTP and create/update user as STAFF (optionally used before branch creation)',
  })
  async verifyStaffOtp(@Body() data: VerifyCustomerOtpDto) {
    return this.branchService.verifyStaffOtp(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a branch' })
  @ApiResponse({ status: 200, description: 'Branch updated', type: Branch })
  update(@Param('id') id: string, @Body() dto: UpdateBranchDto) {
    return this.branchService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive (deactivate) a branch' })
  @ApiResponse({
    status: 200,
    description: 'Branch archived',
    type: MessageResponse,
  })
  remove(@Param('id') id: string) {
    return this.branchService.remove(id);
  }
  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted branch (isActive=true)' })
  @ApiResponse({ status: 200, description: 'Branch restored', type: Branch })
  restore(@Param('id') id: string) {
    return this.branchService.restore(id);
  }

  
  // @Delete(':id/hard')
  // @ApiOperation({ summary: 'Hard delete a branch (permanent delete)' })
  // @ApiResponse({ status: 200, description: 'Branch hard deleted', type: MessageResponse })
  // hardDelete(@Param('id') id: string) {
  //   return this.branchService.hardDelete(id);
  // }
  @Delete(':id/hard')
@ApiOperation({ summary: 'Hard delete ONLY this branch; keep children (re-parent + recompute paths)' })
async hardDeleteOnly(@Param('id') id: string) {
  return this.branchService.hardDeleteOnlyBranch(id);
}

}
