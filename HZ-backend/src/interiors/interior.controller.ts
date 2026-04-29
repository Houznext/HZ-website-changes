import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InteriorService } from './interior.service';
import { InteriorJwtGuard, InteriorJwtPayload } from './interior-jwt.guard';
import { ControllerAuthGuard } from '../guard';
import {
  SendOtpDto,
  VerifyOtpDto,
  LoginOtpDto,
  LoginPasswordDto,
  LoginRepDto,
  SetPasswordDto,
  CreateCustomerDto,
  CreateProjectDto,
  CreateTradeTemplateDto,
  UpdateTradeDto,
  AddDailyUpdateDto,
  AddDesignDto,
  AddDocumentDto,
  AddMediaDto,
  UpdateQcItemDto,
  CreateSnagDto,
  ResolveSnagDto,
  UpdateMilestoneDto,
  CreateReferralDto,
  AddTradeToProjectDto,
  GenerateDprDto,
  UpdateReferralStatusDto,
  UpdatePortfolioDto,
  UpdateCustomerDto,
} from './dto';

type RequestWithUser = Request & { user: InteriorJwtPayload };

@Controller('interiors')
export class InteriorController {
  constructor(private readonly interiorService: InteriorService) {}

  // —— Public auth (no guard) ——
  @Post('auth/send-otp')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.interiorService.sendOtp(dto.mobile, dto.mode ?? 'login');
  }

  @Post('auth/verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.interiorService.verifyOtp(dto.mobile, dto.otp);
  }

  @Post('auth/login-otp')
  loginOtp(@Body() dto: LoginOtpDto) {
    return this.interiorService.loginWithOtp(dto.mobile, dto.otp);
  }

  @Post('auth/login-password')
  loginPassword(@Body() dto: LoginPasswordDto) {
    return this.interiorService.loginWithPassword(dto.mobile, dto.password);
  }

  @Post('auth/login-rep')
  loginRep(@Body() dto: LoginRepDto) {
    return this.interiorService.loginRep(dto.email, dto.password);
  }

  // —— Protected (guard) ——
  @UseGuards(InteriorJwtGuard)
  @Post('auth/set-password')
  async setPassword(@Body() dto: SetPasswordDto, @Req() req: RequestWithUser) {
    const customerId = (req as unknown as { user: { sub: string } }).user.sub;
    await this.interiorService.setPassword(customerId, dto.password);
  }

  @Post('customers')
  createCustomer(@Body() dto: CreateCustomerDto) {
    return this.interiorService.createCustomer(dto);
  }

  @Get('customers/:id')
  getCustomer(@Param('id') id: string) {
    return this.interiorService.getCustomer(id);
  }

  @UseGuards(InteriorJwtGuard)
  @Patch('customers/:id')
  updateCustomer(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.interiorService.updateCustomer(id, dto);
  }

  @Get('customers/:id/projects')
  getCustomerProjects(@Param('id') id: string) {
    return this.interiorService.getCustomerProjects(id);
  }

  @Get('customers/:id/referrals')
  getCustomerReferrals(@Param('id') id: string) {
    return this.interiorService.getReferralsByCustomer(id);
  }

  @UseGuards(InteriorJwtGuard)
  @Patch('customers/:id/change-contact')
  changeCustomerContact(
    @Param('id') id: string,
    @Body() body: { newMobile: string; otp: string },
  ) {
    return this.interiorService.changeCustomerContact(id, body.newMobile, body.otp);
  }

  @Post('customers/:id/referrals')
  createReferral(@Param('id') id: string, @Body() dto: CreateReferralDto) {
    return this.interiorService.createReferralLead(id, dto);
  }

  @Post('projects')
  createProject(@Body() dto: CreateProjectDto) {
    return this.interiorService.createProject(dto);
  }

  @Get('projects')
  getAllProjects(
    @Query('status') status?: string,
    @Query('repId') repId?: string,
    @Query('search') search?: string,
  ) {
    return this.interiorService.getAllProjects({ status, repId, search });
  }

  @Get('portfolio')
  getPortfolio() {
    return this.interiorService.getPortfolioProjects();
  }

  @Get('projects/:id/full')
  getProjectFull(@Param('id') id: string) {
    return this.interiorService.getProjectFull(id);
  }

  @Get('projects/:id/notifications')
  getProjectNotifications(@Param('id') id: string) {
    return this.interiorService.getProjectNotifications(id);
  }

  @Get('projects/:id')
  getProject(@Param('id') id: string) {
    return this.interiorService.getProject(id);
  }

  @UseGuards(InteriorJwtGuard)
  @Patch('projects/:id')
  updateProject(@Param('id') id: string, @Body() dto: Partial<CreateProjectDto>) {
    return this.interiorService.updateProject(id, dto);
  }

  @UseGuards(ControllerAuthGuard)
  @Delete('projects/:id')
  deleteProject(@Param('id') id: string) {
    return this.interiorService.deleteProject(id);
  }

  @UseGuards(ControllerAuthGuard)
  @Patch('projects/:id/portfolio')
  updatePortfolio(
    @Param('id') id: string,
    @Body() dto: UpdatePortfolioDto,
  ) {
    return this.interiorService.updatePortfolioFields(id, dto);
  }

  @Post('projects/:id/designs')
  addDesign(@Body() dto: AddDesignDto) {
    return this.interiorService.addDesignUpload(dto);
  }

  @Get('projects/:id/designs')
  getDesigns(@Param('id') id: string) {
    return this.interiorService.getDesignUploads(id);
  }

  @Post('projects/:id/designs/approve')
  approveDesign(@Param('id') id: string) {
    return this.interiorService.approveDesign(id);
  }

  @Post('projects/:id/designs/revision')
  requestRevision(@Param('id') id: string) {
    return this.interiorService.requestRevision(id);
  }

  @Get('projects/:id/gallery')
  getGallery(
    @Param('id') id: string,
    @Query('tradeId') tradeId?: string,
    @Query('date') date?: string,
    @Query('week') week?: string,
    @Query('month') month?: string,
  ) {
    return this.interiorService.getGallery(id, {
      tradeId,
      date,
      week: week === 'true',
      month: month === 'true',
    });
  }

  @Get('projects/:id/snags')
  getSnags(@Param('id') id: string, @Query('status') status?: string) {
    return this.interiorService.getSnags(id, status);
  }

  @Get('projects/:id/delayed-trades')
  getDelayedTrades(@Param('id') id: string) {
    return this.interiorService.getDelayedTrades(id);
  }

  @Get('projects/:id/activity')
  async getActivity(@Param('id') id: string) {
    return this.interiorService.getProjectActivity(id);
  }

  @UseGuards(InteriorJwtGuard)
  @Post('projects/:id/snags')
  createSnag(@Body() dto: CreateSnagDto) {
    return this.interiorService.createSnag(dto);
  }

  @Get('projects/:id/documents')
  getDocuments(@Param('id') id: string) {
    return this.interiorService.getDocuments(id);
  }

  @UseGuards(InteriorJwtGuard)
  @Post('projects/:id/documents')
  addDocument(@Body() dto: AddDocumentDto) {
    return this.interiorService.addDocument(dto);
  }

  @Get('projects/:id/milestones')
  getMilestones(@Param('id') id: string) {
    return this.interiorService.getPaymentMilestones(id);
  }

  @Get('projects/:id/dpr')
  getDpr(@Param('id') id: string) {
    return this.interiorService.getDprHistory(id);
  }

  @UseGuards(InteriorJwtGuard)
  @Post('projects/:id/dpr')
  generateDpr(@Param('id') id: string, @Body() body: GenerateDprDto) {
    return this.interiorService.generateDpr(id, body.date);
  }

  @Get('trade-templates')
  getTradeTemplates() {
    return this.interiorService.getTradeTemplates();
  }

  @UseGuards(InteriorJwtGuard)
  @Post('trade-templates')
  createTradeTemplate(@Body() dto: CreateTradeTemplateDto) {
    return this.interiorService.createTradeTemplate(dto);
  }

  @Post('projects/:id/trades')
  addTrade(@Param('id') projectId: string, @Body() body: AddTradeToProjectDto) {
    return this.interiorService.addTradeToProject(projectId, body.templateId, body.overrides);
  }

  @UseGuards(InteriorJwtGuard)
  @Patch('trades/:id')
  updateTrade(@Param('id') id: string, @Body() dto: UpdateTradeDto) {
    return this.interiorService.updateTrade(id, dto);
  }

  @UseGuards(InteriorJwtGuard)
  @Post('trades/:id/updates')
  addDailyUpdate(@Body() dto: AddDailyUpdateDto) {
    return this.interiorService.addDailyUpdate(dto);
  }

  @UseGuards(InteriorJwtGuard)
  @Get('trades/:id/updates')
  getDailyUpdates(@Param('id') tradeId: string, @Query('dateFilter') dateFilter?: string) {
    return this.interiorService.getDailyUpdates(tradeId, dateFilter);
  }

  @UseGuards(InteriorJwtGuard)
  @Post('trades/:id/media')
  addMedia(@Body() dto: AddMediaDto) {
    return this.interiorService.addMedia(dto);
  }

  @UseGuards(InteriorJwtGuard)
  @Patch('trades/:tradeId/media/:mediaId')
  updateTradeMediaDailyUpdate(
    @Param('tradeId') tradeId: string,
    @Param('mediaId') mediaId: string,
    @Body() body: { dailyUpdateId: string | null },
  ) {
    return this.interiorService.updateTradeMediaDailyUpdate(
      tradeId,
      mediaId,
      body.dailyUpdateId ?? null,
    );
  }

  @UseGuards(InteriorJwtGuard)
  @Delete('trades/:tradeId/media/:mediaId')
  deleteTradeMedia(@Param('tradeId') tradeId: string, @Param('mediaId') mediaId: string) {
    return this.interiorService.deleteTradeMedia(tradeId, mediaId);
  }

  @Get('qc/:tradeId')
  getQcItems(@Param('tradeId') tradeId: string) {
    return this.interiorService.getQcItems(tradeId);
  }

  @UseGuards(InteriorJwtGuard)
  @Patch('qc/:id')
  updateQcItem(@Param('id') id: string, @Body() dto: UpdateQcItemDto) {
    return this.interiorService.updateQcItem(id, dto);
  }

  @UseGuards(InteriorJwtGuard)
  @Patch('snags/:id/resolve')
  resolveSnag(@Param('id') id: string, @Body() dto: ResolveSnagDto) {
    return this.interiorService.resolveSnag(id, dto);
  }

  @UseGuards(InteriorJwtGuard)
  @Patch('milestones/:id/due-date')
  setMilestoneDueDate(@Param('id') id: string, @Body() body: { dueDate: string }) {
    return this.interiorService.setMilestoneDueDate(id, body.dueDate);
  }

  @UseGuards(InteriorJwtGuard)
  @Patch('milestones/:id/mark-received')
  markMilestoneReceived(
    @Param('id') id: string,
    @Body() body: { receivedAt: string; receiptNote?: string },
  ) {
    return this.interiorService.markMilestoneReceived(id, body.receivedAt, body.receiptNote);
  }

  @UseGuards(InteriorJwtGuard)
  @Patch('milestones/:id/hold')
  milestoneHold(@Param('id') id: string) {
    return this.interiorService.milestoneHold(id);
  }

  @UseGuards(InteriorJwtGuard)
  @Patch('milestones/:id/release-hold')
  milestoneReleaseHold(@Param('id') id: string) {
    return this.interiorService.milestoneReleaseHold(id);
  }

  @UseGuards(InteriorJwtGuard)
  @Patch('milestones/:id')
  updateMilestone(@Param('id') id: string, @Body() dto: UpdateMilestoneDto) {
    return this.interiorService.updateMilestone(id, dto);
  }

  @UseGuards(InteriorJwtGuard)
  @Patch('referrals/:id/status')
  updateReferralStatus(@Param('id') id: string, @Body() body: UpdateReferralStatusDto) {
    return this.interiorService.updateReferralStatus(id, body.status);
  }
}
