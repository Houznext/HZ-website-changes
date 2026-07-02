import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  Req,
  UseGuards,
  Res,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import {
  CancelInvoiceDto,
  CreateInvoiceDto,
  InvoiceListFilterDto,
  RecordPaymentDto,
  UpdateInvoiceDto,
  SendInvoiceDto,
} from './dto/invoice.dto';
import { ControllerAuthGuard, RequestUser } from 'src/guard';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get('stats')
  @UseGuards(ControllerAuthGuard)
  stats(@Query('branchId') branchId?: string) {
    return this.invoicesService.stats(branchId);
  }

  @Get('next-number')
  @UseGuards(ControllerAuthGuard)
  async nextNumber() {
    const invoice_number = await this.invoicesService.getNextInvoiceNumber();
    return { invoice_number };
  }

  @Get('by-mobile/:mobile')
  findByMobile(@Param('mobile') mobile: string) {
    return this.invoicesService.findByMobile(mobile);
  }

  @Get('public/:id/pdf')
  async publicPdf(
    @Param('id') id: string,
    @Query('mobile') mobile: string,
    @Res() res: Response,
  ) {
    const buf = await this.invoicesService.generatePublicPdf(id, mobile);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
    });
    res.send(buf);
  }

  @Get()
  @UseGuards(ControllerAuthGuard)
  list(@Query() query: InvoiceListFilterDto) {
    return this.invoicesService.list(query);
  }

  @Get(':id')
  @UseGuards(ControllerAuthGuard)
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id, true);
  }

  @Get(':id/audit-log')
  @UseGuards(ControllerAuthGuard)
  auditLog(@Param('id') id: string) {
    return this.invoicesService.getAuditLog(id);
  }

  @Get(':id/pdf')
  @UseGuards(ControllerAuthGuard)
  async pdf(@Param('id') id: string, @Res() res: Response) {
    const buf = await this.invoicesService.generatePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
      'Content-Length': buf.length,
    });
    res.send(buf);
  }

  @Post()
  @UseGuards(ControllerAuthGuard)
  create(
    @Body() dto: CreateInvoiceDto,
    @Req() req: { user: RequestUser },
  ) {
    return this.invoicesService.create(dto, req.user);
  }

  @Post('from-quotation/:qid')
  @UseGuards(ControllerAuthGuard)
  fromQuotation(
    @Param('qid') qid: string,
    @Req() req: { user: RequestUser },
  ) {
    return this.invoicesService.fromQuotation(qid, req.user);
  }

  @Patch(':id')
  @UseGuards(ControllerAuthGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
    @Req() req: { user: RequestUser },
  ) {
    return this.invoicesService.update(id, dto, req.user);
  }

  @Post(':id/send')
  @UseGuards(ControllerAuthGuard)
  @HttpCode(200)
  send(
    @Param('id') id: string,
    @Body() dto: SendInvoiceDto,
    @Req() req: { user: RequestUser },
  ) {
    return this.invoicesService.send(id, dto, req.user);
  }

  @Post(':id/reopen')
  @UseGuards(ControllerAuthGuard)
  @HttpCode(200)
  reopen(@Param('id') id: string, @Req() req: { user: RequestUser }) {
    return this.invoicesService.reopen(id, req.user);
  }

  @Post(':id/cancel')
  @UseGuards(ControllerAuthGuard)
  @HttpCode(200)
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelInvoiceDto,
    @Req() req: { user: RequestUser },
  ) {
    return this.invoicesService.cancel(id, dto, req.user);
  }

  @Post(':id/duplicate')
  @UseGuards(ControllerAuthGuard)
  duplicate(@Param('id') id: string, @Req() req: { user: RequestUser }) {
    return this.invoicesService.duplicate(id, req.user);
  }

  @Post(':id/payments')
  @UseGuards(ControllerAuthGuard)
  addPayment(
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
    @Req() req: { user: RequestUser },
  ) {
    return this.invoicesService.addPayment(id, dto, req.user);
  }

  @Patch(':id/payments/:pid')
  @UseGuards(ControllerAuthGuard)
  updatePayment(
    @Param('id') id: string,
    @Param('pid') pid: string,
    @Body() dto: RecordPaymentDto,
    @Req() req: { user: RequestUser },
  ) {
    return this.invoicesService.updatePayment(id, pid, dto, req.user);
  }

  @Delete(':id/payments/:pid')
  @UseGuards(ControllerAuthGuard)
  deletePayment(
    @Param('id') id: string,
    @Param('pid') pid: string,
    @Req() req: { user: RequestUser },
  ) {
    return this.invoicesService.deletePayment(id, pid, req.user);
  }

  @Delete(':id')
  @UseGuards(ControllerAuthGuard)
  @HttpCode(200)
  delete(@Param('id') id: string, @Req() req: { user: RequestUser }) {
    return this.invoicesService.delete(id, req.user);
  }
}
