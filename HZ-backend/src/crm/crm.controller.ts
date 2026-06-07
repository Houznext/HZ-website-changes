import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Delete,
  ParseArrayPipe,
  Query,
  ParseIntPipe,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ControllerAuthGuard, RequestUser } from 'src/guard';
import { CrmLeadService } from './crm.service';
import {
  AssignLeadBodyDto,
  BulkCreateLeadsDto,
  BulkSendLeadsDto,
  CreateCrmLeadDto,
  CreateCrmLeadStatusDefinitionDto,
  CreateCrmFieldOptionDto,
  FindLeadsDto,
  QueryCrmLeadDto,
  ReturnCrmLeadDto,
  UpdateCrmLeadDto,
  UpdateCrmLeadstatusDto,
  UpdateCrmLeadStatusDefinitionDto,
  UpdateCrmFieldOptionDto,
  ReorderCrmFieldOptionsDto,
  ReorderCrmStatusDefinitionsDto,
} from './dto/crm.dto';
import { CRMLead } from './entities/crm.entity';

type RequestWithUser = { user: RequestUser };

@ApiTags('Crmlead')
@Controller('crmlead')
@UseGuards(ControllerAuthGuard)
export class CrmLeadController {
  constructor(private readonly crmleadservice: CrmLeadService) {}

  @Post()
  @ApiOperation({ summary: 'Create CRM lead (branch-scoped)' })
  @ApiResponse({
    status: 201,
    description: 'CRM lead has been successfully created.',
  })
  async create(
    @Req() req: RequestWithUser,
    @Body() dto: CreateCrmLeadDto,
  ): Promise<CRMLead> {
    return this.crmleadservice.createFromUser(req.user, dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple CRM leads (branch-scoped)' })
  @ApiResponse({
    status: 201,
    description: 'CRM leads have been successfully created.',
  })
  async createMoreleads(
    @Req() req: RequestWithUser,
    @Body() body: BulkCreateLeadsDto,
  ): Promise<CRMLead[]> {
    return this.crmleadservice.createMoreFromUser(req.user, body);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all CRM leads (branch-scoped, paginated, filterable)',
  })
  @ApiResponse({ status: 200, description: 'Return CRM leads.' })
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: QueryCrmLeadDto,
  ): Promise<{
    data: ReturnCrmLeadDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    console.log('req.user', req.user);
    return this.crmleadservice.findAll(req.user, query);
  }

  @Get('by-user')
  @ApiOperation({
    summary:
      'Get CRM leads for a specific user between a date range (branch-scoped)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns filtered CRM leads for the user within the given date range',
  })
  async findLeadsForUser(
    @Req() req: RequestWithUser,
    @Query() dto: FindLeadsDto,
  ): Promise<CRMLead[]> {
    return this.crmleadservice.findLeadsByUser(req.user, dto);
  }

  @Get('status-definitions')
  @ApiOperation({ summary: 'List CRM lead status definitions (for admin pickers)' })
  async listStatusDefinitions() {
    return this.crmleadservice.listStatusDefinitions();
  }

  @Post('status-definitions')
  @ApiOperation({ summary: 'Add a custom lead status' })
  async createStatusDefinition(@Body() dto: CreateCrmLeadStatusDefinitionDto) {
    return this.crmleadservice.createStatusDefinition(dto);
  }

  @Post('status-definitions/reorder')
  @ApiOperation({ summary: 'Reorder lead status definitions' })
  async reorderStatusDefinitions(@Body() dto: ReorderCrmStatusDefinitionsDto) {
    return this.crmleadservice.reorderStatusDefinitions(dto);
  }

  @Patch('status-definitions/:defId')
  @ApiOperation({ summary: 'Update label/sort (or value for custom statuses)' })
  async updateStatusDefinition(
    @Param('defId') defId: string,
    @Body() dto: UpdateCrmLeadStatusDefinitionDto,
  ) {
    return this.crmleadservice.updateStatusDefinition(defId, dto);
  }

  @Delete('status-definitions/:defId')
  @ApiOperation({ summary: 'Delete a lead status (must not be in use)' })
  async deleteStatusDefinition(@Param('defId') defId: string) {
    await this.crmleadservice.deleteStatusDefinition(defId);
    return { ok: true };
  }

  @Get('field-options')
  @ApiOperation({ summary: 'List CRM field options (service category, platform, state)' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['service_category', 'platform', 'state'],
  })
  async listFieldOptions(@Query('type') type?: string) {
    return this.crmleadservice.listFieldOptions(type);
  }

  @Post('field-options')
  @ApiOperation({ summary: 'Add a CRM field option' })
  async createFieldOption(@Body() dto: CreateCrmFieldOptionDto) {
    return this.crmleadservice.createFieldOption(dto);
  }

  @Post('field-options/reorder')
  @ApiOperation({ summary: 'Reorder field options for a type' })
  async reorderFieldOptions(@Body() dto: ReorderCrmFieldOptionsDto) {
    return this.crmleadservice.reorderFieldOptions(dto);
  }

  @Patch('field-options/:optionId')
  @ApiOperation({ summary: 'Update label/sort (or value for custom options)' })
  async updateFieldOption(
    @Param('optionId') optionId: string,
    @Body() dto: UpdateCrmFieldOptionDto,
  ) {
    return this.crmleadservice.updateFieldOption(optionId, dto);
  }

  @Delete('field-options/:optionId')
  @ApiOperation({ summary: 'Delete a field option (must not be in use)' })
  async deleteFieldOption(@Param('optionId') optionId: string) {
    await this.crmleadservice.deleteFieldOption(optionId);
    return { ok: true };
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple leads (branch-scoped)' })
  @ApiResponse({
    status: 200,
    description: 'The CRM leads have been successfully deleted.',
  })
  @ApiQuery({
    name: 'ids',
    required: true,
    type: [String],
    description: 'IDs of leads to delete',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    type: String,
    description: 'Branch id scope (optional; role logic decides)',
  })
  async deleteMoreLeads(
    @Req() req: RequestWithUser,
    @Query('ids', new ParseArrayPipe({ items: String, separator: ',' }))
    ids: string[],
    @Query('branchId') branchId?: string,
  ): Promise<void> {
    return this.crmleadservice.deleteMoreLeads(req.user, ids, branchId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a CRM lead (branch-scoped)' })
  @ApiResponse({
    status: 200,
    description: 'The CRM lead has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'CRM lead not found.' })
  async remove(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Query('branchId') branchId?: string,
  ): Promise<void> {
    return this.crmleadservice.remove(req.user, id, branchId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a CRM lead (branch-scoped, partial)' })
  @ApiResponse({
    status: 200,
    description: 'The lead has been successfully updated.',
    type: CRMLead,
  })
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateCrmLeadDto,
  ): Promise<CRMLead> {
    return this.crmleadservice.update(id, dto, req.user);
  }

  @Patch(':id/leadstatus')
  @ApiOperation({ summary: 'Update a lead status (branch-scoped)' })
  @ApiResponse({
    status: 200,
    description: 'The status has been successfully updated.',
  })
  async updateStatus(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateCrmLeadstatusDto,
  ) {
    return await this.crmleadservice.updateStatus(id, dto, req.user);
  }

  @Post('assign/:leadId/:assignedUserId')
  @ApiOperation({
    summary: 'Assign a lead (branch-scoped, legacy params style)',
  })
  async assignLeadParams(
    @Req() req: RequestWithUser,
    @Param('leadId') leadId: string,
    @Param('assignedUserId') assignedUserId: string,
    @Query('branchId') branchId?: string,
  ) {
    const adminId = req.user.id;
    return this.crmleadservice.assignLeadToUser(
      req.user,
      leadId,
      assignedUserId,
      adminId,
      branchId,
    );
  }

  @Post('assign')
  @ApiOperation({ summary: 'Assign a lead (branch-scoped, body style)' })
  async assignLeadBody(
    @Req() req: RequestWithUser,
    @Body() body: AssignLeadBodyDto,
  ) {
    const { leadId, assignedToId, branchId } = body;
    const adminId = req.user.id;

    return this.crmleadservice.assignLeadToUser(
      req.user,
      leadId,
      assignedToId,
      adminId,
      branchId,
    );
  }

  @Post('bulk-send')
  @ApiOperation({ summary: 'Bulk send WhatsApp/SMS to leads (branch-scoped)' })
  @ApiResponse({ status: 201, description: 'Messages sent.' })
  async bulkSend(
    @Req() req: RequestWithUser,
    @Body() dto: BulkSendLeadsDto,
  ) {
    return this.crmleadservice.bulkSendToLeads(
      req.user,
      dto.leadIds,
      dto.channel as 'whatsapp' | 'sms' | 'both',
      dto.branchId,
      dto.customMessage,
    );
  }

  @Get('overdue-count')
  @ApiOperation({
    summary: 'Count overdue Follow-up leads (same rules as CRM sidebar)',
  })
  async overdueCount(
    @Req() req: RequestWithUser,
    @Query('userId') userId: string,
    @Query('branchId') branchId: string,
  ) {
    return this.crmleadservice.countOverdueFollowUps(req.user, userId, branchId);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Recent CRM status activity in a branch (dashboard feed)' })
  async activity(
    @Req() req: RequestWithUser,
    @Query('branchId') branchId?: string,
  ) {
    return this.crmleadservice.getBranchActivityFeed(req.user, branchId);
  }

  // Timeline — must be registered before bare `:id` so paths are not swallowed as UUIDs.
  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get lead timeline (branch-scoped)' })
  async getTimeline(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.crmleadservice.getTimeline(req.user, id, branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a CRM lead by id (branch-scoped)' })
  @ApiResponse({
    status: 200,
    description: 'Return CRM lead.',
    type: CRMLead,
  })
  @ApiResponse({
    status: 404,
    description: 'CRM lead not found.',
  })
  async findOne(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Query('branchId') branchId?: string,
  ): Promise<CRMLead> {
    return this.crmleadservice.findOneById(req.user, id, branchId);
  }
}
