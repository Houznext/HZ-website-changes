import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BuildliveService } from './buildlive.service';
import { ControllerAuthGuard } from '../guard';
import { QcStatus } from './entities/qc-item.entity';
import { SnagStatus, SnagSeverity } from './entities/snag-item.entity';

@Controller('buildlive')
@UseGuards(ControllerAuthGuard)
export class BuildliveController {
  constructor(private readonly service: BuildliveService) {}

  @Get('templates')
  getTemplates() {
    return this.service.getAllTemplates();
  }

  @Post('templates')
  createTemplate(
    @Body()
    body: {
      name: string;
      iconName?: string;
      unit?: string;
      description?: string;
      defaultWeightage?: number;
      checkpoints: string[];
    },
  ) {
    return this.service.createCustomTemplate(body);
  }

  @Get('projects/:projectId/dashboard')
  getProjectDashboard(@Param('projectId') projectId: string) {
    return this.service.getProjectDashboard(projectId);
  }

  @Get('projects/:projectId/scopes')
  getScopes(@Param('projectId') projectId: string) {
    return this.service.getScopesByProject(projectId);
  }

  @Post('projects/:projectId/scopes')
  createScope(
    @Param('projectId') projectId: string,
    @Body()
    body: {
      templateId: string;
      customName?: string;
      assignedVendorName?: string;
      assignedVendorPhone?: string;
      weightage?: number;
      plannedStartDate?: string;
      plannedEndDate?: string;
      scopeArea?: string;
    },
  ) {
    return this.service.createScope(projectId, body);
  }

  @Patch('scopes/:scopeId')
  updateScope(
    @Param('scopeId') scopeId: string,
    @Body() body: Record<string, any>,
  ) {
    return this.service.updateScope(scopeId, body);
  }

  @Get('scopes/:scopeId/updates')
  getUpdates(@Param('scopeId') scopeId: string) {
    return this.service.getUpdatesByScope(scopeId);
  }

  @Post('scopes/:scopeId/updates')
  createUpdate(
    @Param('scopeId') scopeId: string,
    @Body()
    body: {
      updateDate: string;
      progressDelta: number;
      supervisorName: string;
      workDoneToday?: string;
      tomorrowPlan?: string;
      blockerNote?: string;
      labourEntries?: any[];
      materialUsages?: any[];
    },
  ) {
    return this.service.createUpdate(scopeId, body);
  }

  @Get('scopes/:scopeId/qc')
  getQc(@Param('scopeId') scopeId: string) {
    return this.service.getQcByScope(scopeId);
  }

  @Patch('qc/:qcItemId')
  updateQc(
    @Param('qcItemId') qcItemId: string,
    @Body()
    body: {
      status: QcStatus;
      checkedBy: string;
      failureNote?: string;
      photoUrl?: string;
    },
  ) {
    return this.service.updateQcItem(qcItemId, body);
  }

  @Get('scopes/:scopeId/snags')
  getSnags(@Param('scopeId') scopeId: string) {
    return this.service.getSnagsByScope(scopeId);
  }

  @Post('scopes/:scopeId/snags')
  createSnag(
    @Param('scopeId') scopeId: string,
    @Body()
    body: {
      title: string;
      description: string;
      raisedBy: string;
      severity?: SnagSeverity;
    },
  ) {
    return this.service.createSnag(scopeId, body);
  }

  @Patch('snags/:snagId')
  updateSnag(
    @Param('snagId') snagId: string,
    @Body()
    body: { status: SnagStatus; resolutionNote?: string; resolvedBy?: string },
  ) {
    return this.service.updateSnag(snagId, body);
  }

  @Get('projects/:projectId/dpr')
  getDprHistory(@Param('projectId') projectId: string) {
    return this.service.getDprHistory(projectId);
  }

  @Post('projects/:projectId/dpr/generate')
  generateDpr(@Param('projectId') projectId: string) {
    const today = new Date().toISOString().split('T')[0];
    return this.service.generateDpr(projectId, today);
  }
}

