import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreatePaymentSessionDto,
  PaymentSummaryDto,
  PaymentVerificationDto,
  RefundPaymentDto,
} from './dto/payment.dto';
import { PaymentsService } from './payment.service';
import { ControllerAuthGuard } from 'src/guard';

type RequestUser = { id: string; roles?: any[] };

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(ControllerAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('session')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create a payment session (Wallet + Razorpay supported)', })
  @ApiBody({ type: CreatePaymentSessionDto })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST })
  async createPaymentSession(
    @Body() dto: CreatePaymentSessionDto,
    @Req() req: { user: RequestUser },
  ) {
    return this.paymentsService.createPaymentSession(dto, req.user.id);
  }

  // USER → Verify Payment (Frontend callback)
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Razorpay payment after checkout' })
  @ApiBody({ type: PaymentVerificationDto })
  @ApiResponse({ status: HttpStatus.OK })
  async verifyPaymentFromClient(@Body() dto: PaymentVerificationDto) {
    return this.paymentsService.verifyPaymentFromClient(dto);
  }

  // RAZORPAY → SERVER WEBHOOK
  @Post('webhook/razorpay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Razorpay webhook endpoint' })
  @ApiResponse({ status: HttpStatus.OK })
  async handleRazorpayWebhook(@Req() req) {
    const rawBody = req.body;
    const signature = req.headers['x-razorpay-signature'];
    return this.paymentsService.handleRazorpayWebhook(rawBody, signature);
  }

  // ADMIN → Payment audit report (must be before :id)
  @Get('admin/audit-report')
  @ApiOperation({
    summary: 'Admin: Payment audit report – revenue and refunds by source/order type',
  })
  async getPaymentAuditReport(
    @Query('orderType') orderType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentsService.getPaymentAuditReport({
      orderType,
      startDate,
      endDate,
    });
  }

  // ADMIN/USER → GET PAYMENTS FOR ORDER (must be before :id)
  @Get('by-order/:orderId')
  @ApiOperation({ summary: 'Get all payment attempts for an order' })
  @ApiResponse({ status: HttpStatus.OK, type: [PaymentSummaryDto] })
  async getPaymentsForOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentsForOrder(orderId);
  }

  // ADMIN → GET PAYMENT BY ID
  @Get(':id')
  @ApiOperation({ summary: 'Admin: Get payment by id' })
  @ApiResponse({ status: HttpStatus.OK, type: PaymentSummaryDto })
  async getPaymentById(@Param('id') id: string) {
    return this.paymentsService.getPaymentById(id);
  }

  // ADMIN → Refund (partial/full); body optional amount & reason (audit)
  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: Refund payment (full or partial with reason)' })
  @ApiBody({ type: RefundPaymentDto, required: false })
  async refundPayment(
    @Param('id') id: string,
    @Body() dto: RefundPaymentDto,
    @Req() req: { user: RequestUser },
  ) {
    const amount = dto?.amount != null ? Number(dto.amount) : undefined;
    return this.paymentsService.refundPayment(id, {
      amount,
      reason: dto?.reason,
      performedByUserId: req.user?.id,
    });
  }
}
