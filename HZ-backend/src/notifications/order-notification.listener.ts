import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';

type OrderStatusChangedPayload = {
  orderId: string;
  orderNo: string;
  orderType?: string;
  userId?: string;
  newStatus: string;
  oldStatus: string;
  branchId?: string;
  updatedBy: string;
  courierName?: string;
  trackingId?: string;
  customerEmail?: string;
  customerPhone?: string;
  timestamp: string;
};

const STATUS_LABELS: Record<string, string> = {
  CREATED: 'Order Placed',
  PENDING: 'Payment Pending',
  CONFIRMED: 'Order Confirmed',
  ASSIGNED: 'Agent Assigned',
  IN_PROGRESS: 'In Progress',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  RETURN_REQUESTED: 'Return Requested',
  RETURN_APPROVED: 'Return Approved',
  RETURN_REJECTED: 'Return Rejected',
  RETURNED: 'Returned',
  REFUNDED: 'Refunded',
};

const SMS_WORTHY_STATUSES = new Set([
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
  'RETURN_APPROVED',
]);

@Injectable()
export class OrderNotificationListener {
  private readonly logger = new Logger(OrderNotificationListener.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('order.statusChanged')
  async handleOrderStatusChanged(payload: OrderStatusChangedPayload) {
    if (!payload?.userId) return;

    try {
      const label = STATUS_LABELS[payload.newStatus] ?? payload.newStatus;
      const orderRef = payload.orderNo || payload.orderId?.slice(0, 8);
      let message = `Order #${orderRef}: ${label}`;

      if (payload.newStatus === 'SHIPPED' && payload.courierName) {
        message += ` via ${payload.courierName}`;
        if (payload.trackingId) message += ` (Tracking: ${payload.trackingId})`;
      }
      if (payload.newStatus === 'ASSIGNED' && payload.orderType) {
        const typeLabel =
          payload.orderType === 'SOLAR'
            ? 'Solar installation'
            : payload.orderType === 'LEGAL'
              ? 'Legal service'
              : 'Service';
        message = `${typeLabel} for Order #${orderRef} has been assigned to an agent`;
      }

      const notification = await this.notificationService.createNotification({
        userId: payload.userId,
        message,
      });

      this.eventEmitter.emit('realtime.push', {
        userId: payload.userId,
        data: notification,
      });

      if (payload.customerEmail) {
        this.notificationService
          .sendEmailNotification({
            email: payload.customerEmail,
            message,
          })
          .catch((err) =>
            this.logger.warn(`Email notification failed for order ${payload.orderId}: ${err.message}`),
          );
      }

      if (SMS_WORTHY_STATUSES.has(payload.newStatus) && payload.customerPhone) {
        this.notificationService
          .sendSmsNotification({
            phone: payload.customerPhone,
            message,
          })
          .catch((err) =>
            this.logger.warn(`SMS notification failed for order ${payload.orderId}: ${err.message}`),
          );
      }
    } catch (err) {
      this.logger.error(`Order notification failed: ${err.message}`, err.stack);
    }
  }
}
