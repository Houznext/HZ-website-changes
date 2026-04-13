import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Property } from 'src/property/entities/property.entity';
import { ReferralCaseStepLog } from './referralcasesteplog.entity';
import {
  ReferralCaseStatus,
  ReferralCategory,
} from '../enum/refer-and-earn.enum';

@Entity('referral_cases')
export class ReferralCase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => Property, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  property: Property;

  @Index()
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  referrer: User;

  @Column({ nullable: true })
  leadName: string;

  @Column({ nullable: true })
  leadPhone: string;

  @Column({ type: 'varchar', nullable: true })
  category?: ReferralCategory;

  @Column({nullable: true})
  referralCode: string;

  @Column({ nullable: true })
  relationshipType: string;

  @Column({ nullable: true })
  leadEmail: string;

  @Column({ nullable: true })
  leadCity: string;

  @Column({ type: 'text', nullable: true })
  requirementNote?: string;

  @Column({ type: 'int', default: 1 })
  currentStep: number;

  @Column({ type: 'timestamp', nullable: true })
  step1Date?: Date;

  @Column({ type: 'timestamp', nullable: true })
  step2Date?: Date;

  @Column({ type: 'timestamp', nullable: true })
  step3Date?: Date;

  @Column({ type: 'timestamp', nullable: true })
  step4Date?: Date;

  @Column({ type: 'timestamp', nullable: true })
  step5Date?: Date;

  @Column({
    type: 'enum',
    enum: ReferralCaseStatus,
    default: ReferralCaseStatus.OPEN,
  })
  status: ReferralCaseStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  assignedTo?: User;

  @Column({ type: 'text', nullable: true })
  adminRemarks?: string;

  @OneToMany(() => ReferralCaseStepLog, (log) => log.referralCase, {
    cascade: true,
  })
  stepLogs: ReferralCaseStepLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /** Set when user cancels (soft delete). Row is kept, status set to CANCELLED. */
  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date | null;
}
