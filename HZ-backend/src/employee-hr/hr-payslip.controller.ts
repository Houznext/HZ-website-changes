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
import { HrPayslipService } from './hr-payslip.service';
import {
  CreatePayslipDto,
  ListPayslipsQueryDto,
  UpdatePayslipDto,
} from './employee-payslip/dto/employee-payslip.dto';
import { ControllerAuthGuard, RequestUser } from 'src/guard';

type RequestWithUser = { user: RequestUser };

@ApiTags('hr-payslips')
@Controller('hr/payslips')
@UseGuards(ControllerAuthGuard)
export class HrPayslipController {
  constructor(private readonly hrPayslipService: HrPayslipService) {}

  @Get('me')
  @ApiOperation({ summary: 'List payslips for current user' })
  async listMyPayslips(
    @Req() req: RequestWithUser,
    @Query() query: ListPayslipsQueryDto,
  ) {
    const userId = req.user.id;
    return this.hrPayslipService.listForUser(userId, query);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'List payslips for a specific user' })
  async listForUser(
    @Param('userId') userId: string,
    @Query() query: ListPayslipsQueryDto,
  ) {
    return this.hrPayslipService.listForUser(userId, query);
  }

  @Post('user/:userId')
  @ApiOperation({ summary: 'Create a payslip for a specific user' })
  async createForUser(
    @Param('userId') userId: string,
    @Body() dto: CreatePayslipDto,
  ) {
    return this.hrPayslipService.createForUser(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single payslip by id' })
  async getOne(@Param('id') id: number) {
    return this.hrPayslipService.getOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update payslip (status/pdfUrl)' })
  async updatePayslip(
    @Param('id') id: number,
    @Body() dto: UpdatePayslipDto,
  ) {
    return this.hrPayslipService.updatePayslip(id, dto);
  }

  @Get('branch/:branchId')
  @ApiOperation({ summary: 'List payslips for a specific branch' })
  async listForBranch(
    @Param('branchId') branchId: string,
    @Query() query: ListPayslipsQueryDto,
  ) {
    return this.hrPayslipService.listForBranch(branchId, query);
  }
}
