import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { SiteVisitService } from './site-visit.service';
import { PatchSiteVisitDto } from './dto/site-visit.dto';

@ApiTags('admin-site-visits')
@Controller('admin/site-visits')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminSiteVisitController {
  constructor(private readonly visits: SiteVisitService) {}

  @Get()
  list() {
    return this.visits.adminList();
  }

  @Patch(':id')
  patch(@Param('id') id: string, @Body() dto: PatchSiteVisitDto) {
    return this.visits.patch(id, dto);
  }
}
