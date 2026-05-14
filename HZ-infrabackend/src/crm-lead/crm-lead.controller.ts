import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CrmLeadService } from './crm-lead.service';
import {
  BulkAssignDto,
  CreateActivityDto,
  CreateLeadDto,
  CreateSiteVisitDto,
  ListLeadsQueryDto,
  PatchLeadDto,
  PatchPriorityDto,
  PatchSiteVisitDto,
  PatchStageDto,
  SiteVisitListQueryDto,
  StatsQueryDto,
} from './dto/crm-lead.dto';

@ApiTags('admin-crm')
@Controller('admin/crm')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class CrmLeadController {
  constructor(private readonly crm: CrmLeadService) {}

  @Get('stats')
  stats(@Query() q: StatsQueryDto) {
    return this.crm.stats(q);
  }

  @Get('pipeline')
  pipeline() {
    return this.crm.pipeline();
  }

  @Get('follow-ups')
  followUps() {
    return this.crm.followUps();
  }

  @Get('agents')
  agents() {
    return this.crm.listAgents();
  }

  @Get('leads')
  leads(@Query() q: ListLeadsQueryDto) {
    return this.crm.listLeads(q);
  }

  @Post('leads')
  createLead(@Body() dto: CreateLeadDto) {
    return this.crm.create(dto);
  }

  @Post('leads/bulk-assign')
  bulkAssign(@Body() dto: BulkAssignDto) {
    return this.crm.bulkAssign(dto);
  }

  @Get('leads/:id/activities')
  listActivities(@Param('id', ParseUUIDPipe) id: string) {
    return this.crm.listActivities(id);
  }

  @Get('leads/:id')
  one(@Param('id', ParseUUIDPipe) id: string) {
    return this.crm.getOne(id);
  }

  @Patch('leads/:id')
  patch(@Param('id', ParseUUIDPipe) id: string, @Body() dto: PatchLeadDto) {
    return this.crm.patch(id, dto);
  }

  @Patch('leads/:id/stage')
  patchStage(@Param('id', ParseUUIDPipe) id: string, @Body() dto: PatchStageDto) {
    return this.crm.patchStage(id, dto);
  }

  @Patch('leads/:id/priority')
  patchPriority(@Param('id', ParseUUIDPipe) id: string, @Body() dto: PatchPriorityDto) {
    return this.crm.patchPriority(id, dto);
  }

  @Delete('leads/:id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.crm.remove(id);
  }

  @Post('leads/:id/activities')
  addActivity(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateActivityDto,
  ) {
    return this.crm.addActivity(id, dto);
  }

  @Post('site-visits')
  createVisit(@Body() dto: CreateSiteVisitDto) {
    return this.crm.createSiteVisit(dto);
  }

  @Get('site-visits')
  listVisits(@Query() q: SiteVisitListQueryDto) {
    return this.crm.listSiteVisits(q);
  }

  @Patch('site-visits/:id')
  patchVisit(@Param('id', ParseUUIDPipe) id: string, @Body() dto: PatchSiteVisitDto) {
    return this.crm.patchSiteVisit(id, dto);
  }
}
