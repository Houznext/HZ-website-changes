import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { Payment } from './entities/payment.entity';
import { PaymentAuditLog } from './entities/payment-audit-log.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { CartItem } from 'src/cartItems/entities/cartitem.entity';
import {
  CreatePaymentSessionDto,
  PaymentVerificationDto,
} from './dto/payment.dto';
import { PaymentProvider, PaymentStatus, PaymentAuditEvent } from './enums/payment.enum';
import { OrderStatusEnum, OrderItemType, OrderType } from 'src/orders/enum/order.enum';
import { PropertyService } from 'src/property/property.service';
import { PropertyPremiumPlansService } from 'src/property-premium-plans/property-premium-plans.service';
import { PromotionTypeEnum } from 'src/company-onboarding/Enum/company.enum';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;

  constructor(
    @InjectRepository(Payment)
    private readonly payRepo: Repository<Payment>,

    @InjectRepository(PaymentAuditLog)
    private readonly auditRepo: Repository<PaymentAuditLog>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,

    private readonly propertyService: PropertyService,
    private readonly plansService: PropertyPremiumPlansService,
  ) {
    const key = process.env.RAZORPAY_KEY_ID;
    const secret = process.env.RAZORPAY_KEY_SECRET;


    if (!key || !secret) {
      throw new Error(
        'Razorpay keys not found. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env',
      );
    }

    this.razorpay = new Razorpay({
      key_id: key,
      key_secret: secret,
    });
  }

  // CREATE PAYMENT SESSION
  async createPaymentSession(dto: CreatePaymentSessionDto, userId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (Number(order.amountDue) <= 0) {
      throw new ConflictException('Order already fully paid');
    }

    const existingPending = await this.payRepo.findOne({
      where: {
        order: { id: order.id },
        status: PaymentStatus.PENDING,
      },
    });

    if (existingPending) {
      return {
        key: process.env.RAZORPAY_KEY,
        amount: Number(existingPending.amount) * 100,
        currency: existingPending.currency,
        order_id: existingPending.providerOrderId,
      };
    }

    const amountToPay = Number(order.amountDue);

    const rzOrder = await this.razorpay.orders.create({
      amount: Math.round(amountToPay * 100),
      currency: order.currency,
      receipt: String(order.id).slice(0, 40),
      notes: {
        orderId: order.id,
        userId,
        type: order.type,
      },
    });

    const payment = this.payRepo.create({
      order,
      user: { id: userId } as any,
      provider: PaymentProvider.RAZORPAY,
      status: PaymentStatus.PENDING,
      amount: amountToPay.toFixed(2),
      currency: order.currency,
      providerOrderId: rzOrder.id,
    });

    await this.payRepo.save(payment);

    await this.logAudit(PaymentAuditEvent.PAYMENT_CREATED, payment, order, userId);

    return {
      key: process.env.RAZORPAY_KEY,
      keyId: process.env.RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY,
      amount: rzOrder.amount,
      currency: rzOrder.currency,
      order_id: rzOrder.id,
      razorpayOrderId: rzOrder.id,
    };
  }

  async verifyPaymentFromClient(dto: PaymentVerificationDto) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = dto;

    if (!razorpay_signature) {
      throw new BadRequestException('Missing signature');
    }

    const secret = process.env.RAZORPAY_KEY_SECRET ?? process.env.RAZORPAY_SECRET;
    if (!secret || typeof secret !== 'string') {
      throw new BadRequestException(
        'Payment verification not configured. Set RAZORPAY_KEY_SECRET in backend .env',
      );
    }

    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      throw new BadRequestException('Invalid signature');
    }

    const payment = await this.payRepo.findOne({
      where: { providerOrderId: razorpay_order_id },
      relations: ['order'],
    });

    if (!payment) throw new NotFoundException('Payment record not found');

    if (payment.status === PaymentStatus.SUCCESS) {
      return { message: 'Payment already verified' };
    }

    payment.status = PaymentStatus.SUCCESS;
    payment.providerPaymentId = razorpay_payment_id;
    payment.providerSignature = razorpay_signature;
    await this.payRepo.save(payment);

    await this.logAudit(PaymentAuditEvent.PAYMENT_SUCCESS, payment, payment.order, undefined);
    await this.applySuccessfulPayment(payment.order.id, Number(payment.amount));

    // Clear cart after successful payment (order was created from cart; cart was not cleared at order create for non-COD)
    const userId = (payment.order as any).userId ?? payment.order?.user?.id;
    if (userId) {
      const cart = await this.cartRepo.findOne({ where: { userId } });
      if (cart) await this.cartItemRepo.delete({ cartId: cart.id });
    }

    return {
      orderId: payment.order.id,
      paymentId: payment.id,
      status: 'SUCCESS',
    };
  }

  // WEBHOOK HANDLER
  async handleRazorpayWebhook(rawBody: any, signature?: string) {
    if (!signature) throw new BadRequestException('Missing webhook signature');

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(JSON.stringify(rawBody))
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = rawBody.event;

    if (event === 'payment.captured') {
      const rzOrderId = rawBody.payload.payment.entity.order_id;
      const rzPaymentId = rawBody.payload.payment.entity.id;

      const payment = await this.payRepo.findOne({
        where: { providerOrderId: rzOrderId },
        relations: ['order'],
      });

      if (!payment || payment.status === PaymentStatus.SUCCESS) return;

      payment.status = PaymentStatus.SUCCESS;
      payment.providerPaymentId = rzPaymentId;
      payment.rawResponse = rawBody.payload;
      await this.payRepo.save(payment);

      await this.logAudit(PaymentAuditEvent.PAYMENT_SUCCESS, payment, payment.order, undefined);
      await this.applySuccessfulPayment(
        payment.order.id,
        Number(payment.amount),
      );
    }

    if (event === 'payment.failed') {
      const rzOrderId = rawBody.payload.payment.entity.order_id;

      const payment = await this.payRepo.findOne({
        where: { providerOrderId: rzOrderId },
        relations: ['order'],
      });

      if (!payment) return;

      payment.status = PaymentStatus.FAILED;
      payment.rawResponse = rawBody.payload;
      await this.payRepo.save(payment);
      await this.logAudit(PaymentAuditEvent.PAYMENT_FAILED, payment, payment.order, undefined);
    }

    return { received: true };
  }

  private async logAudit(
    event: PaymentAuditEvent,
    payment: Payment,
    order: Order,
    performedByUserId?: string,
    meta?: Record<string, any>,
  ) {
    const orderType = (order as any).type ?? (order as Order).type;
    const audit = this.auditRepo.create({
      event,
      paymentId: payment.id,
      orderId: order.id,
      orderType: orderType != null ? String(orderType) : undefined,
      amount: payment.amount,
      currency: payment.currency,
      meta: meta ?? undefined,
      performedBy: performedByUserId ? ({ id: performedByUserId } as any) : undefined,
    });
    await this.auditRepo.save(audit);
  }

  // APPLY PAYMENT TO ORDER + PROPERTY PREMIUM (when order contains PROPERTY_PREMIUM_PLAN items)
  private async applySuccessfulPayment(orderId: string, paidAmount: number) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
    if (!order) return;

    const newPaid = Number(order.amountPaid) + paidAmount;
    const due = Math.max(Number(order.grandTotal) - newPaid, 0);

    order.amountPaid = newPaid.toFixed(2);
    order.amountDue = due.toFixed(2);

    if (due === 0) {
      order.status = OrderStatusEnum.CONFIRMED;
    } else {
      order.status = OrderStatusEnum.PENDING;
    }

    await this.orderRepo.save(order);

    // Order now CONFIRMED – user has access via getOrdersForUser / getOrderById.
    // LEGAL_PACKAGE and other service items are already in order.items; no extra apply needed.
    // Apply property premium plans to properties (for listers who bought Featured/Sponsored/Analytics)
    const userId = (order as any).userId ?? order.user?.id;
    const actorId = userId ?? 'system';
    for (const item of order.items ?? []) {
      if (item.productType !== OrderItemType.PROPERTY_PREMIUM_PLAN) continue;
      const propertyId = item.meta?.propertyId as string | undefined;
      if (!propertyId) continue;

      try {
        const plan = await this.plansService.findOne(item.productId);
        if (!plan) continue;

        const expiry = new Date();
        expiry.setDate(expiry.getDate() + plan.durationDays);

        const promotionType = plan.promotionType as PromotionTypeEnum;
        await this.propertyService.updatePromotionType(
          propertyId,
          [promotionType],
          expiry,
          actorId,
          actorId,
        );
      } catch {
        // Log and skip; do not fail payment flow
      }
    }
  }

  // GET PAYMENT BY ID
  async getPaymentById(id: string) {
    const payment = await this.payRepo.findOne({
      where: { id },
      relations: ['order', 'user'],
    });

    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  // GET PAYMENTS FOR ORDER
  async getPaymentsForOrder(orderId: string) {
    return this.payRepo.find({
      where: { order: { id: orderId } },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  // REFUND PAYMENT (ADMIN / SYSTEM) – optional amount (full if omitted), reason stored in audit
  async refundPayment(
    paymentId: string,
    opts?: { amount?: number; reason?: string; performedByUserId?: string },
  ) {
    const payment = await this.payRepo.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });

    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException('Only successful payments can be refunded');
    }

    const refundable =
      Number(payment.amount) - Number(payment.refundedAmount ?? 0);

    const refundAmount = opts?.amount ?? refundable;

    if (refundAmount <= 0 || refundAmount > refundable) {
      throw new BadRequestException('Invalid refund amount');
    }

    await this.razorpay.payments.refund(payment.providerPaymentId!, {
      amount: Math.round(refundAmount * 100),
    });

    payment.refundedAmount = (
      Number(payment.refundedAmount ?? 0) + refundAmount
    ).toFixed(2);

    const isFullRefund = Number(payment.refundedAmount) >= Number(payment.amount);
    if (isFullRefund) {
      payment.status = PaymentStatus.REFUNDED;
    }

    await this.payRepo.save(payment);

    const event = isFullRefund ? PaymentAuditEvent.REFUND_FULL : PaymentAuditEvent.REFUND_PARTIAL;
    await this.logAudit(
      event,
      payment,
      payment.order,
      opts?.performedByUserId,
      { reason: opts?.reason, refundAmount },
    );

    // update order paid/due
    const order = payment.order;
    order.amountPaid = Math.max(
      Number(order.amountPaid) - refundAmount,
      0,
    ).toFixed(2);

    order.amountDue = Math.max(
      Number(order.grandTotal) - Number(order.amountPaid),
      0,
    ).toFixed(2);

    if (Number(order.amountPaid) === 0) {
      order.status = OrderStatusEnum.REFUNDED;
    }

    await this.orderRepo.save(order);

    return payment;
  }

  /** Admin: payment audit report – revenue/refunds by order type and date range */
  async getPaymentAuditReport(opts?: {
    orderType?: string;
    startDate?: string; // ISO date
    endDate?: string;
  }) {
    const qb = this.auditRepo.createQueryBuilder('a');

    if (opts?.startDate) {
      qb.andWhere('a.createdAt >= :start', { start: opts.startDate });
    }
    if (opts?.endDate) {
      qb.andWhere('a.createdAt <= :end', { end: opts.endDate + 'T23:59:59.999Z' });
    }
    if (opts?.orderType) {
      qb.andWhere('a.orderType = :orderType', { orderType: opts.orderType });
    }

    const logs = await qb.orderBy('a.createdAt', 'ASC').getMany();

    const byEvent: Record<string, { count: number; totalAmount: number }> = {};
    const byOrderType: Record<string, { successAmount: number; refundAmount: number; count: number }> = {};

    for (const log of logs) {
      const amt = Number(log.amount);
      byEvent[log.event] = byEvent[log.event] ?? { count: 0, totalAmount: 0 };
      byEvent[log.event].count += 1;
      byEvent[log.event].totalAmount += amt;

      const ot = log.orderType ?? 'UNKNOWN';
      byOrderType[ot] = byOrderType[ot] ?? { successAmount: 0, refundAmount: 0, count: 0 };
      byOrderType[ot].count += 1;
      if (log.event === PaymentAuditEvent.PAYMENT_SUCCESS) {
        byOrderType[ot].successAmount += amt;
      } else if (log.event === PaymentAuditEvent.REFUND_FULL || log.event === PaymentAuditEvent.REFUND_PARTIAL) {
        byOrderType[ot].refundAmount += amt;
      }
    }

    return {
      summary: byEvent,
      byOrderType,
      totalRecords: logs.length,
    };
  }
}
