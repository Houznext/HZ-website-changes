import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service';
import { ControllerAuthGuard, AdminPortal } from 'src/guard';

@Controller('audit-logs')
@ApiTags('Audit Logs')
@UseGuards(ControllerAuthGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get('resource/:resource/:resourceId')
  @AdminPortal()
  @ApiOperation({ summary: 'Get audit trail for a specific resource' })
  findByResource(
    @Param('resource') resource: string,
    @Param('resourceId') resourceId: string,
    @Query('take') take?: number,
  ) {
    return this.auditLogService.findByResource(resource, resourceId, take || 50);
  }

  @Get('user/:userId')
  @AdminPortal()
  @ApiOperation({ summary: 'Get audit trail for a specific user' })
  findByUser(
    @Param('userId') userId: string,
    @Query('take') take?: number,
  ) {
    return this.auditLogService.findByUser(userId, take || 50);
  }

  @Get('branch/:branchId')
  @AdminPortal()
  @ApiOperation({ summary: 'Get audit trail for a specific branch' })
  findByBranch(
    @Param('branchId') branchId: string,
    @Query('take') take?: number,
  ) {
    return this.auditLogService.findByBranch(branchId, take || 100);
  }

  @Get('flagged/self-transactions')
  @AdminPortal()
  @ApiOperation({ summary: 'Get flagged self-transactions (fraud detection)' })
  findSelfTransactions(@Query('take') take?: number) {
    return this.auditLogService.findSelfTransactions(take || 50);
  }
}
