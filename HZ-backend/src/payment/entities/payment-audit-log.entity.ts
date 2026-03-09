import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { PaymentAuditEvent } from '../enums/payment.enum';

@Entity('payment_audit_logs')
export class PaymentAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: PaymentAuditEvent })
  @Index()
  event: PaymentAuditEvent;

  @Column({ nullable: true })
  paymentId?: string;

  @Column({ nullable: true })
  orderId?: string;

  /** Order type at time of event (e.g. PROPERTY_PREMIUM, LEGAL) for reporting */
  @Column({ nullable: true })
  @Index()
  orderType?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  amount: string;

  @Column({ length: 3, default: 'INR' })
  currency: string;

  /** For refunds: reason, providerRefundId, etc. */
  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  performedBy?: User | null;

  @CreateDateColumn()
  createdAt: Date;
}
