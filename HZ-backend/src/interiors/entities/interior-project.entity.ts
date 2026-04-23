import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Customer } from './customer.entity';
import { Rep } from './rep.entity';
import { ProjectTrade } from './project-trade.entity';
import { PaymentMilestone } from './payment-milestone.entity';
import { SnagItem } from './snag-item.entity';
import { ProjectDocument } from './project-document.entity';
import { DesignUpload } from './design-upload.entity';
import { DailyProgressReport } from './daily-progress-report.entity';

@Entity('int_projects')
export class InteriorProject extends BaseEntity {
  @Column({ type: 'varchar', nullable: true, default: '' })
  propertyType: string | null;

  @Column({ type: 'int', nullable: true })
  totalAreaSqft: number | null;

  @Column({ type: 'varchar', nullable: true })
  bhk: string | null;

  @Column({ type: 'varchar', nullable: true })
  floorNumber: string | null;

  @Column({ type: 'varchar', nullable: true, default: '' })
  address: string | null;

  @Column({ type: 'varchar', nullable: true, default: '' })
  city: string | null;

  @Column({ type: 'varchar', nullable: true, default: '' })
  locality: string | null;

  @Column({ type: 'varchar', nullable: true })
  pincode: string | null;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  scopesSelected: string[] | null;

  @Column({ type: 'varchar', nullable: true })
  stylePreference: string | null;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  referenceImagesUrls: string[] | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, default: 0 })
  totalBudget: number | null;

  @Column({ type: 'text', nullable: true })
  budgetNote: string | null;

  @Column({ type: 'date', nullable: true })
  expectedStartDate: Date | null;

  @Column({ type: 'date', nullable: true })
  expectedEndDate: Date | null;

  @Column({ type: 'date', nullable: true })
  actualStartDate: Date | null;

  @Column({ type: 'date', nullable: true })
  actualEndDate: Date | null;

  @Column({ type: 'varchar', nullable: true })
  paymentPreference: string | null;

  @Column({ type: 'text', nullable: true })
  specialNotes: string | null;

  @Column({ type: 'varchar', nullable: true })
  floorPlanUrl: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, default: 0 })
  overallProgress: number | null;

  @Column({ type: 'varchar', nullable: true, default: 'onboarding' })
  status: string | null;

  @Column({ type: 'varchar', nullable: true, default: 'pending' })
  designStatus: string | null;

  @Column({ type: 'timestamp', nullable: true })
  designApprovedAt: Date | null;

  @Column({ type: 'boolean', nullable: true, default: false })
  isHandedOver: boolean | null;

  // ── Portfolio / public-facing fields ──────────────────────────────────
  @Column({ type: 'boolean', nullable: true, default: false })
  isPublishedToPortfolio: boolean | null;

  @Column({ type: 'varchar', nullable: true, default: 'Essential' })
  packageTier: string | null;

  @Column({ type: 'int', nullable: true })
  deliveredInDays: number | null;

  @Column({ type: 'text', nullable: true })
  projectStory: string | null;

  @Column({ type: 'text', nullable: true })
  customerTestimonial: string | null;

  @Column({ type: 'varchar', nullable: true })
  customerName: string | null;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true, default: 5.0 })
  customerRating: number | null;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  portfolioPhotoUrls: string[] | null;

  @Column({ type: 'date', nullable: true })
  handoverDate: Date | null;

  @Column({ type: 'uuid', nullable: true })
  customerId: string | null;

  @Column({ type: 'uuid', nullable: true })
  repId: string | null;

  @ManyToOne(() => Customer, (c) => c.projects, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'customerId' })
  customer: Customer | null;

  @ManyToOne(() => Rep, (r) => r.projects, { eager: true, nullable: true })
  @JoinColumn({ name: 'repId' })
  rep: Rep | null;

  @OneToMany(() => ProjectTrade, (t) => t.project)
  trades: ProjectTrade[];

  @OneToMany(() => PaymentMilestone, (m) => m.project)
  paymentMilestones: PaymentMilestone[];

  @OneToMany(() => SnagItem, (s) => s.project)
  snagItems: SnagItem[];

  @OneToMany(() => ProjectDocument, (d) => d.project)
  documents: ProjectDocument[];

  @OneToMany(() => DesignUpload, (d) => d.project)
  designUploads: DesignUpload[];

  @OneToMany(() => DailyProgressReport, (d) => d.project)
  dailyProgressReports: DailyProgressReport[];
}
