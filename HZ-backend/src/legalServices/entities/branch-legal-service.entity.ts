import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Branch } from '../../branch/entities/branch.entity';

export type BranchLegalServiceKind = 'package' | 'service';

@Entity('branch_legal_services')
export class BranchLegalService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', name: 'branch_id' })
  branchId: string;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 20, default: 'package' })
  kind: BranchLegalServiceKind;

  /** Feature list (e.g. "Title search", "EC check") */
  @Column('text', { array: true, default: [] })
  features: string[];

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  originalPrice: string | null;

  /** GST percentage (e.g. 18 for 18%). Used for cart/order tax calculation. */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 18 })
  gstPercent: string;

  /** Whether the displayed price is inclusive of GST (typical for India). */
  @Column({ type: 'boolean', default: true })
  gstInclusive: boolean;

  @Column({ length: 64, nullable: true, default: 'Book Now' })
  buttonText: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  /** Image URLs (S3) for the service/package */
  @Column('text', { array: true, default: [] })
  imageUrls: string[];

  /** Coupon code (optional, e.g. LEGAL20) */
  @Column({ length: 32, nullable: true })
  couponCode: string | null;

  /** percent | fixed */
  @Column({ length: 16, nullable: true })
  discountType: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  discountValue: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  validFrom: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  validTo: Date | null;

  /** User who created this record */
  @Column({ type: 'uuid', name: 'created_by_id', nullable: true })
  createdById: string | null;

  /** User who last updated this record */
  @Column({ type: 'uuid', name: 'updated_by_id', nullable: true })
  updatedById: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
