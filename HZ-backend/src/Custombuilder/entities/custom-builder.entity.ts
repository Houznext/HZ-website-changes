
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CBProperty } from '../custom-property/entities/cb-property.entity';
import { CBService } from '../service-required/entities/cb-service.entity';
import { DailyProgress } from '../daily-progress/entities/daily-progress.entity';
import { CurrentStep } from '../enum/custom-builder.enum';
import { CBQuery } from '../Query/entities/query.entity';
import { LocationDetails } from 'src/property/entities/location.entity';
import { InvoiceEstimator } from 'src/invoice-estimator/entities/invoice-estimator.entity';
import { Phase } from '../phase/entities/phase.entity';
import { Material } from '../Materials/entities/materials.entity';
import { CBDocument } from './cbDocument.entity';
import { User } from 'src/user/entities/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { PaymentTracking } from '../payment-tracking/entities/payment-tracking.entity';

@Entity()
export class CustomBuilder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 0 })
  currentDay: number;

  @Column({
    type: 'enum',
    enum: CurrentStep,
    default: CurrentStep.customerOnboarding,
  })
  currentStep: CurrentStep;

  @Column({ type: 'int', default: 0 })
  onboardingSteps: number;

  @Column('bigint', { nullable: true })
  estimatedCost: number | null;

  @Column('int', { nullable: true })
  estimatedDays: number | null;

  
  @ManyToOne(() => Branch, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  @JoinColumn({ name: 'branchId' })
  branch: Branch | null;

  @Column({ nullable: true })
  branchId: string | null;

  // ---------- CUSTOMER USER ----------
  @ManyToOne(() => User, (u) => u.customBuilders, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'customerId' })
  customer: User | null;

  @Column({ type: 'uuid', nullable: true })
  customerId: string | null;

  // ---------- CREATED BY (ADMIN / STAFF) ----------
  @ManyToOne(() => User, (u) => u.createdCustomBuilders, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser: User | null;

  @Column({ type: 'uuid', nullable: true })
  createdByUserId: string | null;

  // ---------- REST AS BEFORE ----------
  @OneToMany(() => CBDocument, (doc) => doc.customBuilder, { cascade: true })
  documents: CBDocument[];

  @OneToOne(() => CBProperty, (property) => property.customBuilder, {
    cascade: true,
  })
  @JoinColumn()
  propertyInformation: CBProperty;

  @OneToOne(() => CBService, (service) => service.customBuilder, {
    cascade: true,
  })
  @JoinColumn()
  servicesRequired: CBService;

  @OneToMany(() => DailyProgress, (progress) => progress.customBuilder, {
    cascade: true,
  })
  @JoinColumn()
  logs: DailyProgress[];

  @OneToOne(() => LocationDetails, (location) => location.customBuilder, {
    cascade: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  location: LocationDetails;

  @OneToMany(() => CBQuery, (query) => query.customBuilder)
  queries: CBQuery[];

  @OneToMany(() => InvoiceEstimator, (invoice) => invoice.customBuilder)
  invoice: InvoiceEstimator[];

  @OneToMany(() => Phase, (phase) => phase.customBuilder)
  phases: Phase[];

  @OneToMany(() => Material, (material) => material.cb, { cascade: true })
  materials: Material[];

  @OneToMany(() => PaymentTracking, (payment) => payment.customBuilder, {
    cascade: true,
  })
  payments: PaymentTracking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

