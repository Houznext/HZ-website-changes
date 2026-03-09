import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { User } from 'src/user/entities/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { CartItem } from 'src/cartItems/entities/cartitem.entity';
import { OrderType } from 'src/orders/enum/order.enum';

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
};

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true, type: 'uuid' })
  userId: string;

  @OneToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index()
  @Column({ nullable: true, type: 'uuid' })
  branchId?: string;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branchId' })
  branch?: Branch | null;

  @Index()
  @Column({ nullable: true, type: 'uuid' })
  createdByUserId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser?: User | null;

  @Column({ type: 'varchar', default: OrderType.ELECTRONICS })
  type: OrderType;

  // ------------ MONEY BREAKDOWN (same structure as Order) ------------
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

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  grandTotal: string;

  @Column({ type: 'jsonb', nullable: true })
  billingDetails?: PartyJson;

  @Column({ type: 'jsonb', nullable: true })
  shippingDetails?: ShippingDetailsJson;

  @Column({ type: 'jsonb', nullable: true })
  serviceDetails?: ServiceDetailsJson;

  @Column({ type: 'jsonb', nullable: true })
  taxBreakup?: TaxBreakupJson;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;

  @OneToMany(() => CartItem, (item) => item.cart, {
    cascade: true,
    eager: true,
  })
  items: CartItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
