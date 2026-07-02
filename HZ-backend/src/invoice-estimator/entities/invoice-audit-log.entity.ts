import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { InvoiceEstimator } from './invoice-estimator.entity';

@Entity('invoice_audit_log')
@Index(['invoiceId'])
export class InvoiceAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'invoice_id', type: 'uuid' })
  invoiceId: string;

  @ManyToOne(() => InvoiceEstimator, (inv) => inv.auditLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invoice_id' })
  invoice: InvoiceEstimator;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 40 })
  action: string;

  @Column({ name: 'before_snapshot', type: 'jsonb', nullable: true })
  beforeSnapshot: Record<string, unknown> | null;

  @Column({ name: 'after_snapshot', type: 'jsonb', nullable: true })
  afterSnapshot: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
