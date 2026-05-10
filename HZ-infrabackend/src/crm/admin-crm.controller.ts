import { Controller, Get, Param, Patch, Query, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CrmService } from './crm.service';
import { PatchLeadDto } from './dto/crm.dto';

@ApiTags('admin-crm')
@Controller('admin/crm')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminCrmController {
  constructor(private readonly crm: CrmService) {}

  @Get('leads/stats')
  stats() {
    return this.crm.stats();
  }

  @Get('leads')
  leads(@Query('stage') stage?: string, @Query('assignedTo') assignedTo?: string) {
    return this.crm.list({ stage, assignedTo });
  }

  @Patch('leads/:id')
  patch(@Param('id') id: string, @Body() dto: PatchLeadDto) {
    return this.crm.patch(id, dto);
  }
}
