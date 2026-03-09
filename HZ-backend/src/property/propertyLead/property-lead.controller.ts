import { Controller, Post, Body, Get, Param, UseGuards,Query } from '@nestjs/common';
import { PropertyLeadService } from './property-lead.service';
import { CreateContactSellerDto } from '../dto/property-lead.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ControllerAuthGuard } from 'src/guard';

@Controller('property-leads')
@ApiTags('PropertyLeads')
export class PropertyLeadController {
  constructor(private readonly leadService: PropertyLeadService) {}
  // @UseGuards(ControllerAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Property Leads sent successfully.' })
  @ApiResponse({
    status: 201,
    description: 'Property Leads sent successfully.',
  })
  create(@Body() dto: CreateContactSellerDto) {
    return this.leadService.createLead(dto);
  }

 @Get(':id')
  async getLeads(
    @Param('id') id: string,
    @Query('isProject') isProject?: string,
  ) {
    const projectFlag = isProject === 'true';
    return this.leadService.getLeads(id, projectFlag);
  }
}
