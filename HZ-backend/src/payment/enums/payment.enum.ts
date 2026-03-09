export enum PaymentStatus {
  CREATED = 'CREATED',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentProvider {
  RAZORPAY = 'RAZORPAY',
  STRIPE = 'STRIPE',
  CASHFREE = 'CASHFREE',
  WALLET = 'WALLET',
}

/** Events for payment audit trail (revenue/refund reporting). */
export enum PaymentAuditEvent {
  PAYMENT_CREATED = 'PAYMENT_CREATED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  REFUND_PARTIAL = 'REFUND_PARTIAL',
  REFUND_FULL = 'REFUND_FULL',
}