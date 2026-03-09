import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Categories, LeadStatus, PropertyTypeEnum } from '../enums/crm.enum';
import { User } from 'src/user/entities/user.entity';
import { LeadStatusLog } from './leadStatus.entity';
import { Branch } from 'src/branch/entities/branch.entity'; // <-- new

@Entity('crm')
@Index(['branchId', 'createdAt'])
@Index(['branchId', 'leadstatus'])
@Index(['Phonenumber'])
export class CRMLead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  Fullname: string;

  @Column({ nullable: false })
  Phonenumber: string;

  @Column({ nullable: true, default: 'Unknown' })
  email: string;

  @Column({
    type: 'enum',
    enum: PropertyTypeEnum,
    default: PropertyTypeEnum.flat,
    nullable: true,
  })
  propertytype?: PropertyTypeEnum;

  @Column({ default: 'Unknown', nullable: true })
  bhk?: string;

  @Column({ type: 'varchar', nullable: true })
  platform: string;

  @Column({ type: 'varchar', nullable: true })
  serviceType?: string;

  @Column({ nullable: true, default: 'Unknown' })
  review?: string;

  @Column({ nullable: true, default: 'Unknown' })
  city: string;

  @Column({ nullable: true, default: 'Unknown' })
  state: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: Categories,
    default: Categories.Residential,
  })
  category?: Categories;

  @Column({ type: 'int', nullable: true })
  monthly_bill?: number;

  @Column({ nullable: true })
  pincode?: string;

  @Column('jsonb', { nullable: true })
  rooms: {
    livingRoom: number;
    kitchen: number;
    bedroom: number;
    bathroom: number;
    dining: number;
  };

  @Column({ nullable: true })
  package: string;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.New,
    nullable: true,
  })
  leadstatus?: LeadStatus;

  @Column({ nullable: true })
  paintArea?: string;

  @Column({ nullable: true })
  paintingPackage?: string;

  @Column({ nullable: true })
  paintingType?: string;

  // --- Assignment + Audit ---
  @ManyToOne(() => User, (user) => user.crmLeads, { nullable: true })
  assignedTo?: User;

  @ManyToOne(() => User, { nullable: true })
  assignedBy?: User;

  @ManyToOne(() => User, { nullable: true })
  createdBy?: User;

  // --- Branch Scope (critical for BranchRole/Permissions) ---
  @Column({ type: 'uuid', nullable: true })
  @Index()
  branchId: string;

  @ManyToOne(() => Branch, { nullable: true })
  branch: Branch;

  // --- Dates ---
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  updatedAt?: Date;

  // --- Address granularity ---
  @Column({ nullable: true, type: 'int' })
  phase?: string;

  @Column({ nullable: true })
  houseNo?: string;

  @Column({ nullable: true })
  apartmentName?: string;

  @Column({ nullable: true })
  areaName?: string;

  // --- Status-driven timestamps ---
  @Column({ type: 'timestamptz', nullable: true })
  followUpDate?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  visitScheduledAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  visitDoneAt?: Date;

  // --- Rejection & Future Potential ---
  @Column({ type: 'varchar', length: 500, nullable: true })
  rejectionReason?: string;

  @Column({ type: 'boolean', default: false })
  isFuturePotential: boolean;

  // --- Timeline logs ---
  @OneToMany(() => LeadStatusLog, (log) => log.lead)
  statusLogs: LeadStatusLog[];
}
