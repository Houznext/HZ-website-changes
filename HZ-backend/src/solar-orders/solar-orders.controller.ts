import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Body,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ControllerAuthGuard } from 'src/guard';
import { SolarOrdersService } from './solar-orders.service';

@ApiTags('Solar Orders')
@ApiBearerAuth()
@Controller('solar-orders')
@UseGuards(ControllerAuthGuard)
export class SolarOrdersController {
  constructor(private readonly solarOrdersService: SolarOrdersService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get solar dashboard stats' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiResponse({ status: HttpStatus.OK })
  async getDashboardStats(@Query('branchId') branchId?: string) {
    return this.solarOrdersService.getDashboardStats(branchId);
  }

  @Get()
  @ApiOperation({ summary: 'List all solar orders (admin, paginated, filtered)' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: HttpStatus.OK })
  async findAll(
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.solarOrdersService.findAll({
      branchId,
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single solar installation detail' })
  @ApiResponse({ status: HttpStatus.OK })
  async findOne(@Param('id') id: string) {
    return this.solarOrdersService.findOne(id);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign agent to solar installation' })
  @ApiResponse({ status: HttpStatus.OK })
  async assignAgent(
    @Param('id') id: string,
    @Body() body: { agentUserId: string; assignedBy: string },
  ) {
    return this.solarOrdersService.assignAgent(id, body.agentUserId, body.assignedBy);
  }

  @Patch(':id/notes')
  @ApiOperation({ summary: 'Update solar installation notes' })
  @ApiResponse({ status: HttpStatus.OK })
  async updateNotes(
    @Param('id') id: string,
    @Body() body: { notes: string },
  ) {
    return this.solarOrdersService.updateNotes(id, body.notes);
  }
}
