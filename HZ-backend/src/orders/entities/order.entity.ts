import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { OrderItem } from './order-item.entity';
import {
  OrderStatusEnum,
  OrderType,
  ReturnReasonEnum,
} from '../enum/order.enum';
import { Payment } from 'src/payment/entities/payment.entity';

export type AddressJson = {
  line1: string;
  line2?: string;
  landmark?: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
};

export type PartyJson = {
  name: string;
  phone: string;
  email?: string;
  gstin?: string;
  address?: AddressJson;
};

export type TaxBreakupJson = {
  gstin?: string;
  placeOfSupplyState?: string;
  isIGST?: boolean;
  cgstPercent?: number;
  sgstPercent?: number;
  igstPercent?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  notes?: string;
};

export type ServiceDetailsJson = {
  scheduleDate?: string;
  timeSlot?: string;
  siteAddress?: AddressJson;
  assignedToUserId?: string;
  assignedAt?: string;
  serviceStartAt?: string;
  serviceEndAt?: string;
  notes?: string;
};

export type ShippingDetailsJson = {
  deliveryAddress?: AddressJson;
  recipientName?: string;
  recipientPhone?: string;
  instructions?: string;

  courierName?: string;
  trackingId?: string;
  shippedAt?: string;
  deliveredAt?: string;

  shiprocketOrderId?: number;
  shiprocketShipmentId?: number;
  courierCompanyId?: number;
  lastTrackingUpdate?: string;
  lastTrackingTimestamp?: string;
  etd?: string;
};

export type StatusHistoryItem = {
  status: OrderStatusEnum | string;
  at: string;
  byUserId?: string;
  by?: string;
  note?: string;
};

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true })
  orderNo: string; // ex: OC-2025-0000123

  @ManyToOne(() => User, { nullable: true })
  user?: User | null;

  // important for admin-created orders
  @ManyToOne(() => User, { nullable: true })
  createdByUser?: User | null;

  @ManyToOne(() => Branch, { nullable: true })
  branch?: Branch | null;

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];

  @Column({ type: 'enum', enum: OrderType })
  type: OrderType;

  @Column({
    type: 'enum',
    enum: OrderStatusEnum,
    default: OrderStatusEnum.CREATED,
  })
  status: OrderStatusEnum;

  // ------------ MONEY BREAKDOWN ------------
  @Column({ length: 3, default: 'INR' })
  currency: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  subTotal: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  discountTotal: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  couponDiscount: string;

  @Column({ nullable: true })
  couponCode?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  taxTotal: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  shippingTotal: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  feeTotal: string;

  // final payable (this is what you should show as "total")
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  grandTotal: string;

  // payment tracking
  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  amountPaid: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  amountDue: string;

  // ------------ DETAILS ------------
  @Column({ type: 'jsonb', nullable: true })
  billingDetails?: PartyJson;

  @Column({ type: 'jsonb', nullable: true })
  shippingDetails?: ShippingDetailsJson;

  @Column({ type: 'jsonb', nullable: true })
  serviceDetails?: ServiceDetailsJson;

  @Column({ type: 'jsonb', nullable: true })
  taxBreakup?: TaxBreakupJson;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  // timeline
  @Column({ type: 'jsonb', nullable: true })
  statusHistory?: StatusHistoryItem[];

  // cancellation / refund metadata
  @Column({ nullable: true })
  cancelReason?: string;

  @Column({ type: 'enum', enum: ReturnReasonEnum, nullable: true })
  returnReason?: ReturnReasonEnum;

  @Column({ nullable: true })
  returnComment?: string;

  @Column({ type: 'jsonb', nullable: true })
  returnImages?: string[]; // S3 URLs

  @Column({ nullable: true })
  returnRequestedAt?: Date;

  @Column({ nullable: true })
  returnApprovedAt?: Date;

  @Column({ nullable: true })
  returnRejectedAt?: Date;

  @Column({ nullable: true })
  returnRejectedReason?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  refundAmount?: string;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
