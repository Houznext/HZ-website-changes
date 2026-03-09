import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomBuilder } from 'src/Custombuilder/entities/custom-builder.entity';

export enum PaymentStatus {
  Pending = 'Pending',
  Partial = 'Partial',
  Completed = 'Completed',
  Overdue = 'Overdue',
  Refunded = 'Refunded',
}

export enum PaymentMethod {
  Cash = 'Cash',
  BankTransfer = 'Bank Transfer',
  UPI = 'UPI',
  Cheque = 'Cheque',
  CreditCard = 'Credit Card',
  DebitCard = 'Debit Card',
  Other = 'Other',
}

export enum PaymentType {
  Advance = 'Advance',
  Milestone = 'Milestone',
  MaterialPurchase = 'Material Purchase',
  LabourPayment = 'Labour Payment',
  FinalSettlement = 'Final Settlement',
  Other = 'Other',
}

@Entity()
export class PaymentTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.Pending,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.Milestone,
  })
  paymentType: PaymentType;

  @Column({ type: 'date', nullable: true })
  paymentDate: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  referenceNumber: string;

  @Column({ type: 'text', nullable: true })
  receiptUrl: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  phaseName: string;

  @Column({ type: 'text', nullable: true })
  receivedBy: string;

  @ManyToOne(() => CustomBuilder, (cb) => cb.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customBuilderId' })
  customBuilder: CustomBuilder;

  @Column({ type: 'uuid' })
  customBuilderId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
