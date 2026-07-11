import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { InvoiceItem } from './invoice-item.entity';
import { InvoicePayment } from './invoice-payment.entity';
import { InvoiceAuditLog } from './invoice-audit-log.entity';

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'revised'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'cancelled';

export type InvoiceType = 'interiors' | 'furniture' | 'mixed';

@Entity('invoice_estimator')
export class InvoiceEstimator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Branch, (branch) => branch.invoiceEstimators, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch | null;

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId?: string | null;

  @Column({ name: 'custombuilderid', type: 'uuid', nullable: true })
  customBuilderId?: string | null;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.invoiceEstimators, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'posted_by_id' })
  postedBy: User;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: InvoiceStatus;

  @Column({ name: 'invoice_type', type: 'varchar', length: 20, default: 'interiors' })
  invoiceType: InvoiceType;

  @Column({ name: 'linked_quotation_id', type: 'uuid', nullable: true })
  linkedQuotationId: string | null;

  @Column({ name: 'linked_lb_project_id', type: 'int', nullable: true })
  linkedLbProjectId: number | null;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string | null;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date | null;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date | null;

  /** Original sent invoice this revision was created from (null for non-revised). */
  @Column({ name: 'revised_from_id', type: 'uuid', nullable: true })
  revisedFromId: string | null;

  /** Snapshot of when the parent invoice was emailed (for revised card copy). */
  @Column({ name: 'original_sent_at', type: 'timestamp', nullable: true })
  originalSentAt: Date | null;

  /** Snapshot of the email the parent invoice was sent to. */
  @Column({ name: 'original_sent_email', type: 'varchar', length: 120, nullable: true })
  originalSentEmail: string | null;

  @Column({ name: 'last_viewed_at', type: 'timestamp', nullable: true })
  lastViewedAt: Date | null;

  // Legacy bill-to columns (camelCase in DB)
  @Column('text')
  billToName: string;

  @Column('text', { nullable: true })
  billToAddress: string | null;

  @Column('text', { nullable: true })
  billToCity: string | null;

  @Column({ name: 'bill_to_gstin', type: 'varchar', length: 15, nullable: true })
  billToGstin: string | null;

  @Column({ name: 'bill_to_state', type: 'varchar', length: 50, nullable: true })
  billToState: string | null;

  @Column({ name: 'bill_to_state_code', type: 'varchar', length: 2, nullable: true })
  billToStateCode: string | null;

  @Column({ name: 'bill_to_pincode', type: 'varchar', length: 10, nullable: true })
  billToPincode: string | null;

  @Column({ name: 'bill_to_email', type: 'varchar', length: 120, nullable: true })
  billToEmail: string | null;

  @Column({ type: 'varchar', nullable: true })
  customerMobile: string | null;

  @Column({ name: 'bill_to_mobile', type: 'varchar', length: 15, nullable: true })
  billToMobile: string | null;

  // Legacy ship-to
  @Column('text', { nullable: true })
  shipToAddress: string | null;

  @Column('text', { nullable: true })
  shipToCity: string | null;

  @Column({ name: 'ship_to_same_as_bill', type: 'boolean', default: true })
  shipToSameAsBill: boolean;

  @Column({ name: 'ship_to_name', type: 'varchar', length: 120, nullable: true })
  shipToName: string | null;

  @Column({ name: 'ship_to_gstin', type: 'varchar', length: 15, nullable: true })
  shipToGstin: string | null;

  @Column({ name: 'ship_to_state', type: 'varchar', length: 50, nullable: true })
  shipToState: string | null;

  @Column({ name: 'ship_to_state_code', type: 'varchar', length: 2, nullable: true })
  shipToStateCode: string | null;

  @Column({ name: 'ship_to_pincode', type: 'varchar', length: 10, nullable: true })
  shipToPincode: string | null;

  @Column({ name: 'ship_to_email', type: 'varchar', length: 120, nullable: true })
  shipToEmail: string | null;

  @Column({ name: 'supplier_name', type: 'varchar', length: 120, default: 'Houznext Interiors Pvt Ltd' })
  supplierName: string;

  @Column({ name: 'supplier_gstin', type: 'varchar', length: 15, default: '' })
  supplierGstin: string;

  @Column({ name: 'supplier_address', type: 'text', default: '' })
  supplierAddress: string;

  @Column({ name: 'supplier_state', type: 'varchar', length: 50, default: 'Telangana' })
  supplierState: string;

  @Column({ name: 'supplier_state_code', type: 'varchar', length: 2, default: '36' })
  supplierStateCode: string;

  @Column({ name: 'supplier_pan', type: 'varchar', length: 10, nullable: true })
  supplierPan: string | null;

  @Column({ name: 'supplier_bank_name', type: 'varchar', length: 80, nullable: true })
  supplierBankName: string | null;

  @Column({ name: 'supplier_bank_account', type: 'varchar', length: 30, nullable: true })
  supplierBankAccount: string | null;

  @Column({ name: 'supplier_bank_ifsc', type: 'varchar', length: 15, nullable: true })
  supplierBankIfsc: string | null;

  @Column({ name: 'supplier_upi_id', type: 'varchar', length: 60, nullable: true })
  supplierUpiId: string | null;

  @Column({ name: 'last_payment_date', type: 'varchar', length: 20, nullable: true })
  lastPaymentDate: string | null;

  @Column({ name: 'last_payment_method', type: 'varchar', length: 40, nullable: true })
  lastPaymentMethod: string | null;

  @Column('text')
  invoiceNumber: string;

  @Column('text')
  invoiceDate: string;

  @Column('text')
  invoiceDue: string;

  @Column('text', { nullable: true })
  invoiceTerms: string | null;

  @Column({ name: 'subtotal', type: 'decimal', precision: 14, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  subTotal: number | null;

  @Column({ name: 'total_item_discount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalItemDiscount: number;

  @Column({ name: 'invoice_discount_type', type: 'varchar', length: 10, nullable: true })
  invoiceDiscountType: 'percent' | 'amount' | null;

  @Column({ name: 'invoice_discount_value', type: 'decimal', precision: 14, scale: 2, nullable: true })
  invoiceDiscountValue: number | null;

  @Column({ name: 'invoice_discount_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  invoiceDiscountAmount: number;

  @Column({ name: 'taxable_value', type: 'decimal', precision: 14, scale: 2, default: 0 })
  taxableValue: number;

  @Column({ name: 'cgst_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  cgstAmount: number;

  @Column({ name: 'sgst_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  sgstAmount: number;

  @Column({ name: 'igst_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  igstAmount: number;

  @Column({ name: 'total_tax', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalTax: number;

  @Column({ name: 'round_off', type: 'decimal', precision: 5, scale: 2, default: 0 })
  roundOff: number;

  @Column({ name: 'grand_total', type: 'decimal', precision: 14, scale: 2, default: 0 })
  grandTotal: number;

  @Column({ name: 'amount_in_words', type: 'varchar', length: 255, default: '' })
  amountInWords: string;

  @Column({ name: 'total_paid', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalPaid: number;

  @Column({ name: 'balance_due', type: 'decimal', precision: 14, scale: 2, default: 0 })
  balanceDue: number;

  @Column({ name: 'fully_paid_at', type: 'timestamp', nullable: true })
  fullyPaidAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string | null;

  @Column({ name: 'terms_and_conditions', type: 'text', nullable: true })
  termsAndConditions: string | null;

  @Column({ name: 'additional_work_details', type: 'text', nullable: true })
  additionalWorkDetails: string | null;

  @Column({ name: 'authorised_signatory', type: 'varchar', length: 120, nullable: true })
  authorisedSignatory: string | null;

  @Column({ name: 'prepared_by_user_id', type: 'uuid', nullable: true })
  preparedByUserId: string | null;

  @Column({ name: 'prepared_by_name', type: 'varchar', length: 120, nullable: true })
  preparedByName: string | null;

  @Column({ name: 'prepared_by_role', type: 'varchar', length: 80, nullable: true })
  preparedByRole: string | null;

  @Column({ name: 'prepared_by_email', type: 'varchar', length: 120, nullable: true })
  preparedByEmail: string | null;

  @Column({ name: 'prepared_by_phone', type: 'varchar', length: 15, nullable: true })
  preparedByPhone: string | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @Column({ name: 'last_edited_by', type: 'uuid', nullable: true })
  lastEditedBy: string | null;

  @Column('jsonb', { nullable: true })
  items: {
    item_name: string;
    description?: string;
    quantity: number;
    price: number;
    area?: number;
  }[] | null;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  lineItems: InvoiceItem[];

  @OneToMany(() => InvoicePayment, (p) => p.invoice, { cascade: true })
  payments: InvoicePayment[];

  @OneToMany(() => InvoiceAuditLog, (log) => log.invoice)
  auditLogs: InvoiceAuditLog[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @Column({ name: 'restore_token', type: 'varchar', length: 64, nullable: true })
  restoreToken: string | null;

  @Column({ name: 'deleted_by_id', type: 'uuid', nullable: true })
  deletedById: string | null;
}
