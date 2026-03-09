import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/user/entities/user.entity';
import { PaymentProvider, PaymentStatus } from '../enums/payment.enum';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => User, { nullable: true })
  user?: User | null;

  @Column({ type: 'enum', enum: PaymentProvider })
  provider: PaymentProvider;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.CREATED,
  })
  status: PaymentStatus;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  refundedAmount: string;

  @Column({ length: 3, default: 'INR' })
  currency: string;

  @Column({ nullable: true })
  providerOrderId?: string;

  @Column({ nullable: true })
  providerPaymentId?: string;

  @Column({ nullable: true })
  providerSignature?: string;

  @Column({ type: 'jsonb', nullable: true })
  rawResponse?: any;

  @ManyToOne(() => User, { nullable: true })
  createdByUser?: User | null;

  @ManyToOne(() => User, { nullable: true })
  verifiedByUser?: User | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
