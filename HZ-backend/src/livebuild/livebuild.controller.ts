import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  AnyFilesInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { LivebuildService } from './livebuild.service';
import { LivebuildOtpService } from './livebuild-otp.service';
import { LivebuildPortalService } from './livebuild-portal.service';
import {
  LivebuildAuthGuard,
  LivebuildDualAuthGuard,
  LivebuildRequest,
} from './livebuild-auth.guard';
import { ControllerAuthGuard } from 'src/guard';
import {
  AddRoomWorkTypeDto,
  CreateCustomerDto,
  CreateDocumentMetaDto,
  CreateDprDto,
  CreateMaterialDto,
  CreatePaymentDto,
  CreateProjectDto,
  CreateQueryDto,
  CreateRoomDto,
  CreateWorkTypeDto,
  ReplyQueryDto,
  SendOtpDto,
  UpdateCustomerDto,
  UpdateMaterialDto,
  UpdatePaymentDto,
  UpdateProjectDto,
  UpdateRoomDto,
  UpdateRoomWorkTypeDto,
  UpdateWorkTypeDto,
  UpsertPropertyInfoDto,
  VerifyOtpDto,
} from './dto';

@Controller('livebuild')
export class LivebuildController {
  constructor(
    private readonly livebuildService: LivebuildService,
    private readonly otpService: LivebuildOtpService,
    private readonly portalService: LivebuildPortalService,
  ) {}

  // —— OTP (public) ——
  @Post('otp/send')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.otpService.sendOtp(dto.mobile);
  }

  @Post('otp/verify')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.otpService.verifyOtp(dto.mobile, dto.otp);
  }

  @Post('auth/send-otp')
  sendOtpAlias(@Body() body: { mobile?: string }) {
    return this.otpService.sendOtp(body.mobile ?? '');
  }

  @Post('auth/verify-otp')
  async verifyOtpAlias(@Body() body: { mobile?: string; otp?: string }) {
    const result = await this.otpService.verifyOtp(
      body.mobile ?? '',
      body.otp ?? '',
    );
    return {
      token: result.token,
      customer: { mobile: result.customerMobile },
    };
  }

  @Post('customers/send-otp')
  @UseGuards(ControllerAuthGuard)
  adminSendCustomerOtp(@Body() body: { phone?: string; mobile?: string }) {
    return this.otpService.sendOtp(body.phone ?? body.mobile ?? '');
  }

  @Post('customers/verify-otp')
  @UseGuards(ControllerAuthGuard)
  async adminVerifyCustomerOtp(
    @Body() body: { phone?: string; mobile?: string; otp?: string },
  ) {
    const result = await this.otpService.verifyOtp(
      body.phone ?? body.mobile ?? '',
      body.otp ?? '',
    );
    return { verified: true, otpToken: result.token };
  }

  // —— Website: customer portal ——
  @Get('my/stats')
  @UseGuards(LivebuildAuthGuard)
  myStats(@Req() req: LivebuildRequest) {
    return this.portalService.myStats(req.lbMobile!);
  }

  @Get('my/projects')
  @UseGuards(LivebuildAuthGuard)
  myProjects(@Req() req: LivebuildRequest) {
    return this.portalService.myProjectList(req.lbMobile!);
  }

  @Get('my/projects/:id')
  @UseGuards(LivebuildAuthGuard)
  myProjectHome(@Param('id', ParseIntPipe) id: number, @Req() req: LivebuildRequest) {
    return this.portalService.projectHome(id, req.lbMobile!);
  }

  @Get('my/projects/:id/day-progress')
  @UseGuards(LivebuildAuthGuard)
  myDayProgress(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: LivebuildRequest,
    @Query('roomId') roomId?: string,
    @Query('date') date?: string,
    @Query('range') range?: string,
  ) {
    return this.portalService.dayProgress(id, req.lbMobile!, {
      roomId,
      date,
      range,
    });
  }

  @Get('my/projects/:id/rooms/:roomId')
  @UseGuards(LivebuildAuthGuard)
  myRoom(
    @Param('id', ParseIntPipe) id: number,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Req() req: LivebuildRequest,
  ) {
    return this.portalService.roomDetail(id, roomId, req.lbMobile!);
  }

  @Get('my/projects/:id/payments')
  @UseGuards(LivebuildAuthGuard)
  myPayments(@Param('id', ParseIntPipe) id: number, @Req() req: LivebuildRequest) {
    return this.portalService.paymentsPortal(id, req.lbMobile!);
  }

  @Get('my/projects/:id/queries')
  @UseGuards(LivebuildAuthGuard)
  myQueries(@Param('id', ParseIntPipe) id: number, @Req() req: LivebuildRequest) {
    return this.portalService.queriesPortal(id, req.lbMobile!);
  }

  @Post('my/projects/:id/queries')
  @UseGuards(LivebuildAuthGuard)
  myCreateQuery(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: LivebuildRequest,
    @Body() dto: CreateQueryDto,
  ) {
    return this.livebuildService.createQuery(
      id,
      dto,
      this.livebuildService.resolveAccess(req),
    );
  }

  @Get('my/projects/:id/property-info')
  @UseGuards(LivebuildAuthGuard)
  myPropertyInfo(@Param('id', ParseIntPipe) id: number, @Req() req: LivebuildRequest) {
    return this.portalService.propertyInfoPortal(id, req.lbMobile!);
  }

  @Get('my/projects/:id/materials')
  @UseGuards(LivebuildAuthGuard)
  myMaterials(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: LivebuildRequest,
    @Query('status') status?: string,
    @Query('room') room?: string,
  ) {
    return this.portalService.materialsPortal(id, req.lbMobile!, { status, room });
  }

  @Get('my/projects/:id/documents')
  @UseGuards(LivebuildAuthGuard)
  myDocuments(@Param('id', ParseIntPipe) id: number, @Req() req: LivebuildRequest) {
    return this.portalService.documentsPortal(id, req.lbMobile!);
  }

  @Get('my/projects/:id/viz')
  @UseGuards(LivebuildAuthGuard)
  myViz(@Param('id', ParseIntPipe) id: number, @Req() req: LivebuildRequest) {
    return this.portalService.vizPortal(id, req.lbMobile!);
  }

  // —— Admin: dashboard ——
  @Get('dashboard')
  @UseGuards(ControllerAuthGuard)
  dashboard() {
    return this.livebuildService.getDashboard();
  }

  @Get('projects/next-code')
  @UseGuards(ControllerAuthGuard)
  async nextCode() {
    const { nextCode } = await this.livebuildService.getNextProjectCode();
    return { code: nextCode, nextCode };
  }

  // —— Projects ——
  @Get('projects')
  @UseGuards(ControllerAuthGuard)
  listProjects(@Query('q') q?: string) {
    return this.livebuildService.listProjectsAdmin(q);
  }

  @Post('projects')
  @UseGuards(ControllerAuthGuard)
  createProject(@Body() dto: CreateProjectDto) {
    return this.livebuildService.createProject(dto);
  }

  @Get('projects/:id')
  @UseGuards(LivebuildDualAuthGuard)
  getProject(@Param('id', ParseIntPipe) id: number, @Req() req: LivebuildRequest) {
    return this.livebuildService.getProject(
      id,
      this.livebuildService.resolveAccess(req),
    );
  }

  @Patch('projects/:id')
  @UseGuards(ControllerAuthGuard)
  updateProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.livebuildService.updateProject(id, dto);
  }

  @Delete('projects/:id')
  @UseGuards(ControllerAuthGuard)
  deleteProject(@Param('id', ParseIntPipe) id: number) {
    return this.livebuildService.deleteProject(id);
  }

  @Get('settings/team')
  @UseGuards(ControllerAuthGuard)
  listTeam() {
    return [
      { id: '1', name: 'Suresh Babu', role: 'Site Manager', initials: 'SB' },
      { id: '2', name: 'Kavitha Nair', role: 'Project Coordinator', initials: 'KN' },
    ];
  }

  // —— Rooms ——
  @Get('projects/:id/rooms')
  @UseGuards(LivebuildDualAuthGuard)
  listRooms(@Param('id', ParseIntPipe) id: number, @Req() req: LivebuildRequest) {
    return this.livebuildService.listRooms(
      id,
      this.livebuildService.resolveAccess(req),
    );
  }

  @Post('projects/:id/rooms')
  @UseGuards(ControllerAuthGuard)
  createRoom(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateRoomDto) {
    return this.livebuildService.createRoom(id, dto);
  }

  @Patch('rooms/:id')
  @UseGuards(ControllerAuthGuard)
  updateRoom(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoomDto) {
    return this.livebuildService.updateRoom(id, dto);
  }

  @Delete('rooms/:id')
  @UseGuards(ControllerAuthGuard)
  deleteRoom(@Param('id', ParseIntPipe) id: number) {
    return this.livebuildService.deleteRoom(id);
  }

  // —— Room work types ——
  @Get('rooms/:id/work-types')
  @UseGuards(LivebuildDualAuthGuard)
  listRoomWorkTypes(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: LivebuildRequest,
  ) {
    return this.livebuildService.listRoomWorkTypes(
      id,
      this.livebuildService.resolveAccess(req),
    );
  }

  @Post('rooms/:id/work-types')
  @UseGuards(ControllerAuthGuard)
  addRoomWorkType(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddRoomWorkTypeDto,
  ) {
    return this.livebuildService.addRoomWorkType(id, dto.workTypeId);
  }

  @Patch('room-wt/:id')
  @UseGuards(ControllerAuthGuard)
  updateRoomWorkType(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoomWorkTypeDto,
  ) {
    return this.livebuildService.updateRoomWorkType(id, dto);
  }

  @Delete('room-wt/:id')
  @UseGuards(ControllerAuthGuard)
  deleteRoomWorkType(@Param('id', ParseIntPipe) id: number) {
    return this.livebuildService.deleteRoomWorkType(id);
  }

  // —— DPR ——
  @Get('projects/:id/dpr')
  @UseGuards(LivebuildDualAuthGuard)
  listDpr(
    @Param('id', ParseIntPipe) id: number,
    @Query('date') date: string | undefined,
    @Query('roomId') roomId: string | undefined,
    @Req() req: LivebuildRequest,
  ) {
    return this.livebuildService.listDpr(
      id,
      this.livebuildService.resolveAccess(req),
      date,
      roomId ? Number(roomId) : undefined,
    );
  }

  @Post('projects/:id/dpr')
  @UseGuards(ControllerAuthGuard)
  createDpr(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateDprDto) {
    return this.livebuildService.createDpr(id, dto);
  }

  @Post('projects/:id/dpr/submit')
  @UseGuards(ControllerAuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  submitDprBatch(
    @Param('id', ParseIntPipe) id: number,
    @Body('date') date: string | undefined,
    @Body('roomId') roomId: string | undefined,
    @Body('entries') entries: string | undefined,
    @UploadedFiles()
    files: { fieldname: string; buffer: Buffer; mimetype: string; size: number; originalname: string }[],
  ) {
    return this.livebuildService.submitDprBatch(
      id,
      {
        date: date ?? new Date().toISOString().slice(0, 10),
        roomId: roomId ?? '',
        entries: entries ?? '[]',
      },
      files ?? [],
    );
  }

  @Get('dpr/:id/photos')
  @UseGuards(LivebuildDualAuthGuard)
  listDprPhotos(@Param('id', ParseIntPipe) id: number, @Req() req: LivebuildRequest) {
    return this.livebuildService.listDprPhotos(
      id,
      this.livebuildService.resolveAccess(req),
    );
  }

  @Post('dpr/:id/photos')
  @UseGuards(ControllerAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  uploadDprPhotos(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: { buffer: Buffer; mimetype: string; size: number; originalname: string }[],
  ) {
    return this.livebuildService.uploadDprPhotos(id, files ?? []);
  }

  @Delete('dpr/photos/:id')
  @UseGuards(ControllerAuthGuard)
  deleteDprPhoto(@Param('id', ParseIntPipe) id: number) {
    return this.livebuildService.deleteDprPhoto(id);
  }

  // —— Payments ——
  @Get('projects/:id/payments')
  @UseGuards(LivebuildDualAuthGuard)
  listPayments(@Param('id', ParseIntPipe) id: number, @Req() req: LivebuildRequest) {
    return this.livebuildService.listPayments(
      id,
      this.livebuildService.resolveAccess(req),
    );
  }

  @Post('projects/:id/payments')
  @UseGuards(ControllerAuthGuard)
  createPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.livebuildService.createPayment(id, dto);
  }

  @Patch('payments/:id')
  @UseGuards(ControllerAuthGuard)
  updatePayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.livebuildService.updatePayment(id, dto);
  }

  @Delete('payments/:id')
  @UseGuards(ControllerAuthGuard)
  deletePayment(@Param('id', ParseIntPipe) id: number) {
    return this.livebuildService.deletePayment(id);
  }

  // —— Queries ——
  @Get('projects/:id/queries')
  @UseGuards(LivebuildDualAuthGuard)
  listQueries(@Param('id', ParseIntPipe) id: number, @Req() req: LivebuildRequest) {
    return this.livebuildService.listQueries(
      id,
      this.livebuildService.resolveAccess(req),
    );
  }

  @Post('projects/:id/queries')
  @UseGuards(LivebuildAuthGuard)
  createQuery(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateQueryDto,
    @Req() req: LivebuildRequest,
  ) {
    return this.livebuildService.createQuery(
      id,
      dto,
      this.livebuildService.resolveAccess(req),
    );
  }

  @Patch('queries/:id/reply')
  @UseGuards(ControllerAuthGuard)
  replyQuery(@Param('id', ParseIntPipe) id: number, @Body() dto: ReplyQueryDto) {
    return this.livebuildService.replyQuery(id, dto);
  }

  @Post('projects/:projectId/queries/:queryId/reply')
  @UseGuards(ControllerAuthGuard)
  replyQueryAlias(
    @Param('queryId', ParseIntPipe) queryId: number,
    @Body() body: { reply: string; repliedBy?: string },
  ) {
    return this.livebuildService.replyQuery(queryId, {
      reply: body.reply,
      repliedBy: body.repliedBy,
    });
  }

  @Delete('queries/:id')
  @UseGuards(ControllerAuthGuard)
  deleteQuery(@Param('id', ParseIntPipe) id: number) {
    return this.livebuildService.deleteQuery(id);
  }

  // —— Documents ——
  @Get('projects/:id/documents')
  @UseGuards(LivebuildDualAuthGuard)
  listDocuments(@Param('id', ParseIntPipe) id: number, @Req() req: LivebuildRequest) {
    return this.livebuildService.listDocuments(
      id,
      this.livebuildService.resolveAccess(req),
    );
  }

  @Post('projects/:id/documents')
  @UseGuards(ControllerAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: { buffer: Buffer; mimetype: string; size: number; originalname: string },
    @Body() meta: CreateDocumentMetaDto,
  ) {
    return this.livebuildService.uploadDocument(id, file, meta);
  }

  @Delete('documents/:id')
  @UseGuards(ControllerAuthGuard)
  deleteDocument(@Param('id', ParseIntPipe) id: number) {
    return this.livebuildService.deleteDocument(id);
  }

  // —— Materials ——
  @Get('projects/:id/materials')
  @UseGuards(LivebuildDualAuthGuard)
  listMaterials(@Param('id', ParseIntPipe) id: number, @Req() req: LivebuildRequest) {
    return this.livebuildService.listMaterials(
      id,
      this.livebuildService.resolveAccess(req),
    );
  }

  @Post('projects/:id/materials')
  @UseGuards(ControllerAuthGuard)
  createMaterial(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateMaterialDto,
  ) {
    return this.livebuildService.createMaterial(id, dto);
  }

  @Patch('materials/:id')
  @UseGuards(ControllerAuthGuard)
  updateMaterial(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMaterialDto,
  ) {
    return this.livebuildService.updateMaterial(id, dto);
  }

  @Delete('materials/:id')
  @UseGuards(ControllerAuthGuard)
  deleteMaterial(@Param('id', ParseIntPipe) id: number) {
    return this.livebuildService.deleteMaterial(id);
  }

  // —— Work types ——
  @Get('work-types')
  @UseGuards(ControllerAuthGuard)
  listWorkTypes() {
    return this.livebuildService.listWorkTypes();
  }

  @Post('work-types')
  @UseGuards(ControllerAuthGuard)
  createWorkType(@Body() dto: CreateWorkTypeDto) {
    return this.livebuildService.createWorkType(dto);
  }

  @Patch('work-types/:id')
  @UseGuards(ControllerAuthGuard)
  updateWorkType(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWorkTypeDto,
  ) {
    return this.livebuildService.updateWorkType(id, dto);
  }

  @Delete('work-types/:id')
  @UseGuards(ControllerAuthGuard)
  deleteWorkType(@Param('id', ParseIntPipe) id: number) {
    return this.livebuildService.deleteWorkType(id);
  }

  // —— Customers ——
  @Get('customers')
  @UseGuards(ControllerAuthGuard)
  listCustomers() {
    return this.livebuildService.listCustomers();
  }

  @Post('customers')
  @UseGuards(ControllerAuthGuard)
  createCustomer(@Body() dto: CreateCustomerDto) {
    return this.livebuildService.createCustomer(dto);
  }

  @Get('customers/:id')
  @UseGuards(ControllerAuthGuard)
  getCustomer(@Param('id', ParseIntPipe) id: number) {
    return this.livebuildService.getCustomer(id);
  }

  @Patch('customers/:id')
  @UseGuards(ControllerAuthGuard)
  updateCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.livebuildService.updateCustomer(id, dto);
  }

  // —— Property info ——
  @Get('projects/:id/property-info')
  @UseGuards(LivebuildDualAuthGuard)
  getPropertyInfo(@Param('id', ParseIntPipe) id: number, @Req() req: LivebuildRequest) {
    return this.livebuildService.getPropertyInfo(
      id,
      this.livebuildService.resolveAccess(req),
    );
  }

  @Put('projects/:id/property-info')
  @UseGuards(ControllerAuthGuard)
  upsertPropertyInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertPropertyInfoDto,
  ) {
    return this.livebuildService.upsertPropertyInfo(id, dto);
  }
}
