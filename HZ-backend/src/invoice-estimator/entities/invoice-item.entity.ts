import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { InvoiceEstimator } from './invoice-estimator.entity';

export type InvoicePricingMode = 'unit' | 'area';
export type InvoiceDiscountType = 'percent' | 'amount';

@Entity('invoice_items')
@Index(['invoiceId', 'sortOrder'])
export class InvoiceItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'invoice_id', type: 'uuid' })
  invoiceId: string;

  @ManyToOne(() => InvoiceEstimator, (inv) => inv.lineItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invoice_id' })
  invoice: InvoiceEstimator;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'group_name', type: 'varchar', length: 80, nullable: true })
  groupName: string | null;

  @Column({ name: 'item_name', type: 'varchar', length: 200 })
  itemName: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'hsn_sac_code', type: 'varchar', length: 10, nullable: true })
  hsnSacCode: string | null;

  @Column({ name: 'pricing_mode', type: 'varchar', length: 10 })
  pricingMode: InvoicePricingMode;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quantity: number | null;

  @Column({ name: 'unit_label', type: 'varchar', length: 20, nullable: true })
  unitLabel: string | null;

  @Column({ name: 'unit_price', type: 'decimal', precision: 14, scale: 2, nullable: true })
  unitPrice: number | null;

  @Column({ name: 'area_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  areaValue: number | null;

  @Column({ name: 'area_unit', type: 'varchar', length: 20, nullable: true })
  areaUnit: string | null;

  @Column({ name: 'rate_per_unit', type: 'decimal', precision: 14, scale: 2, nullable: true })
  ratePerUnit: number | null;

  @Column({ name: 'gross_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  grossAmount: number;

  @Column({ name: 'item_discount_type', type: 'varchar', length: 10, nullable: true })
  itemDiscountType: InvoiceDiscountType | null;

  @Column({ name: 'item_discount_value', type: 'decimal', precision: 14, scale: 2, nullable: true })
  itemDiscountValue: number | null;

  @Column({ name: 'item_discount_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  itemDiscountAmount: number;

  @Column({ name: 'taxable_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  taxableAmount: number;

  @Column({ name: 'gst_rate', type: 'decimal', precision: 4, scale: 2, default: 18 })
  gstRate: number;

  @Column({ name: 'gst_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  gstAmount: number;

  @Column({ name: 'cgst_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  cgstAmount: number;

  @Column({ name: 'sgst_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  sgstAmount: number;

  @Column({ name: 'igst_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  igstAmount: number;

  @Column({ name: 'line_total', type: 'decimal', precision: 14, scale: 2, default: 0 })
  lineTotal: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
