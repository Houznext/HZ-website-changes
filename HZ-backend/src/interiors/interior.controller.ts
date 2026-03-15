import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InteriorService } from './interior.service';
import { InteriorJwtGuard, InteriorJwtPayload } from './interior-jwt.guard';
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
} from './dto';

type RequestWithUser = Request & { user: InteriorJwtPayload };

@Controller('interiors')
export class InteriorController {
  constructor(private readonly interiorService: InteriorService) {}

  // —— Public auth (no guard) ——
  @Post('auth/send-otp')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.interiorService.sendOtp(dto.mobile);
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

  @UseGuards(InteriorJwtGuard)
  @Post('customers')
  createCustomer(@Body() dto: CreateCustomerDto) {
    return this.interiorService.createCustomer(dto);
  }

  @UseGuards(InteriorJwtGuard)
  @Get('customers/:id')
  getCustomer(@Param('id') id: string) {
    return this.interiorService.getCustomer(id);
  }

  @UseGuards(InteriorJwtGuard)
  @Get('customers/:id/projects')
  getCustomerProjects(@Param('id') id: string) {
    return this.interiorService.getCustomerProjects(id);
  }

  @UseGuards(InteriorJwtGuard)
  @Get('customers/:id/referrals')
  getCustomerReferrals(@Param('id') id: string) {
    return this.interiorService.getReferralsByCustomer(id);
  }

  @UseGuards(InteriorJwtGuard)
  @Post('customers/:id/referrals')
  createReferral(@Param('id') id: string, @Body() dto: CreateReferralDto) {
    return this.interiorService.createReferralLead(id, dto);
  }

  @UseGuards(InteriorJwtGuard)
  @Post('projects')
  createProject(@Body() dto: CreateProjectDto) {
    return this.interiorService.createProject(dto);
  }

  @UseGuards(InteriorJwtGuard)
  @Get('projects')
  getAllProjects(
    @Query('status') status?: string,
    @Query('repId') repId?: string,
    @Query('search') search?: string,
  ) {
    return this.interiorService.getAllProjects({ status, repId, search });
  }

  @UseGuards(InteriorJwtGuard)
  @Get('projects/:id')
  getProject(@Param('id') id: string) {
    return this.interiorService.getProject(id);
  }

  @UseGuards(InteriorJwtGuard)
  @Patch('projects/:id')
  updateProject(@Param('id') id: string, @Body() dto: Partial<CreateProjectDto>) {
    return this.interiorService.updateProject(id, dto);
  }

  @UseGuards(InteriorJwtGuard)
  @Post('projects/:id/designs')
  addDesign(@Body() dto: AddDesignDto) {
    return this.interiorService.addDesignUpload(dto);
  }

  @UseGuards(InteriorJwtGuard)
  @Get('projects/:id/designs')
  getDesigns(@Param('id') id: string) {
    return this.interiorService.getDesignUploads(id);
  }

  @UseGuards(InteriorJwtGuard)
  @Post('projects/:id/designs/approve')
  approveDesign(@Param('id') id: string) {
    return this.interiorService.approveDesign(id);
  }

  @UseGuards(InteriorJwtGuard)
  @Post('projects/:id/designs/revision')
  requestRevision(@Param('id') id: string) {
    return this.interiorService.requestRevision(id);
  }

  @UseGuards(InteriorJwtGuard)
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

  @UseGuards(InteriorJwtGuard)
  @Get('projects/:id/snags')
  getSnags(@Param('id') id: string, @Query('status') status?: string) {
    return this.interiorService.getSnags(id, status);
  }

  @UseGuards(InteriorJwtGuard)
  @Post('projects/:id/snags')
  createSnag(@Body() dto: CreateSnagDto) {
    return this.interiorService.createSnag(dto);
  }

  @UseGuards(InteriorJwtGuard)
  @Get('projects/:id/documents')
  getDocuments(@Param('id') id: string) {
    return this.interiorService.getDocuments(id);
  }

  @UseGuards(InteriorJwtGuard)
  @Post('projects/:id/documents')
  addDocument(@Body() dto: AddDocumentDto) {
    return this.interiorService.addDocument(dto);
  }

  @UseGuards(InteriorJwtGuard)
  @Get('projects/:id/milestones')
  getMilestones(@Param('id') id: string) {
    return this.interiorService.getPaymentMilestones(id);
  }

  @UseGuards(InteriorJwtGuard)
  @Get('projects/:id/dpr')
  getDpr(@Param('id') id: string) {
    return this.interiorService.getDprHistory(id);
  }

  @UseGuards(InteriorJwtGuard)
  @Post('projects/:id/dpr')
  generateDpr(@Param('id') id: string, @Body() body: GenerateDprDto) {
    return this.interiorService.generateDpr(id, body.date);
  }

  @UseGuards(InteriorJwtGuard)
  @Get('trade-templates')
  getTradeTemplates() {
    return this.interiorService.getTradeTemplates();
  }

  @UseGuards(InteriorJwtGuard)
  @Post('trade-templates')
  createTradeTemplate(@Body() dto: CreateTradeTemplateDto) {
    return this.interiorService.createTradeTemplate(dto);
  }

  @UseGuards(InteriorJwtGuard)
  @UseGuards(InteriorJwtGuard)
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
