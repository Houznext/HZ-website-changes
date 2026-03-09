import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Delete,
  ParseArrayPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { ApiOperation, ApiTags, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { ServiceCustomLeadService } from './servicecustomlead.service';
import {
  CreateServiceCustomLeadDto,
  UpdateServiceCustomLeadstatusDto,
} from './dto/servicecustomlead.dto';
import { ServiceCustomLead } from './entities/servicecustomlead.entity';
import { ControllerAuthGuard } from 'src/guard';
@ApiTags('ServiceCustomLead')
@Controller('Servicecustomlead')
export class ServiceCustomLeadController {
  constructor(
    private readonly servicecustomleadservice: ServiceCustomLeadService,
  ) {}
  @UseGuards(ControllerAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a service custom lead' })
  @ApiResponse({
    status: 201,
    description: 'a service custom lead has been successfully created.',
  })
  @ApiResponse({
    status: 409,
    description:
      'A lead with the provided details already exists. Response body includes message and existingLead with the existing record.',
  })
  async create(
    @Body() createservicecustomleadDto: CreateServiceCustomLeadDto,
  ): Promise<ServiceCustomLead> {
    return this.servicecustomleadservice.create(createservicecustomleadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all service custom lead' })
  @ApiResponse({ status: 200, description: 'Return all service custom lead.' })
  async findAll(): Promise<ServiceCustomLead[]> {
    return this.servicecustomleadservice.findAll();
  }
  @Get('by-user/:userId')
  @ApiOperation({
    summary: 'Get service leads for a specific user between a date range',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns filtered Service leads for the user within the given date range',
  })
  async findLeadsForUser(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ServiceCustomLead[]> {
    return this.servicecustomleadservice.findLeadsByUser(
      userId,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service custom lead by ID' })
  @ApiResponse({ status: 200, description: 'Return the service custom lead.' })
  @ApiResponse({ status: 404, description: 'custom lead not found.' })
  async findOne(@Param('id') id: string): Promise<ServiceCustomLead> {
    return this.servicecustomleadservice.findOne(id);
  }
  @UseGuards(ControllerAuthGuard)
  @Delete('bulk')
  @ApiOperation({ summary: 'Delete more leads' })
  @ApiResponse({
    status: 200,
    description: 'The service leads has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'service lead not found.' })
  @ApiQuery({
    name: 'ids',
    required: true,
    type: [Number],
    description: 'Ids of leads to delete',
  })
  async deleteMoreLeads(
    @Query('ids', new ParseArrayPipe({ items: String, separator: ',' }))
    ids: string[],
  ): Promise<void> {
    return this.servicecustomleadservice.deleteMoreLeads(ids);
  }
  @UseGuards(ControllerAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a custom lead' })
  @ApiResponse({
    status: 200,
    description: 'The service custom lead has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'custom lead not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.servicecustomleadservice.remove(id);
  }
  @UseGuards(ControllerAuthGuard)
  @Patch(':id/leadstatus')
  @ApiOperation({ summary: 'Update a status' })
  @ApiResponse({
    status: 200,
    description: 'The status has been successfully updated.',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateServiceCustomLeadstatusDto,
  ) {
    return await this.servicecustomleadservice.updateStatus(
      id,
      updateStatusDto,
    );
  }
  @UseGuards(ControllerAuthGuard)
  @Post('assign/:leadId/:assignedUserId/:adminId')
  async assignLead(
    @Param('leadId') leadId: string,
    @Param('assignedUserId') assignedUserId: string,
    @Param('adminId') adminId: string,
  ) {
    return this.servicecustomleadservice.assignLeadToUser(
      leadId,
      assignedUserId,
      adminId,
    );
  }
}
