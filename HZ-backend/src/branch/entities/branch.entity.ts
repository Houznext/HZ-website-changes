import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BranchCategory, BranchLevel, OwnerIdProofType } from '../enum/branch.enum';
import { BranchRole } from 'src/branchRole/entities/branch-role.entity';
import { InvoiceEstimator } from 'src/invoice-estimator/entities/invoice-estimator.entity';
import { BranchLegalService } from '../../legalServices/entities/branch-legal-service.entity';

@Entity()
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: BranchLevel })
  level: BranchLevel;

  @ManyToOne(() => Branch, (b) => b.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  parent?: Branch | null;

  @OneToMany(() => Branch, (b) => b.parent)
  children: Branch[];

  @Index()
  @Column({ type: 'varchar', length: 512 })
  path: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isHeadOffice: boolean;

  @Column({ type: 'boolean', default: false })
  hasFranchiseFeePaid: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  franchisePaymentRef?: string;

  @Column({ default: false })
  isStateHQ: boolean;

  @Column({ nullable: true, type: 'uuid' })
  createdById: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  category?: BranchCategory;

  @Column({ type: 'int', nullable: true })
  stateId?: number | null;

  @OneToMany(() => BranchRole, (r) => r.branch, { cascade: true })
  branchRoles: BranchRole[];

  @Column({ type: 'int', nullable: true })
  cityId?: number | null;

  // ── Owner identity / verification (all nullable) ──

  @Column({ type: 'varchar', length: 12, nullable: true })
  ownerAadhaarNumber?: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  ownerPanNumber?: string | null;

  @Column({ type: 'varchar', length: 15, nullable: true })
  ownerGstNumber?: string | null;

  @Column({ type: 'enum', enum: OwnerIdProofType, nullable: true })
  ownerIdProofType?: OwnerIdProofType | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  ownerIdProofUrl?: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  ownerPhotoUrl?: string | null;

  @Column({ type: 'date', nullable: true })
  ownerDateOfBirth?: Date | null;

  @Column({ type: 'text', nullable: true })
  ownerAddress?: string | null;

  // ── Branch physical details (all nullable) ──

  @Column({ type: 'text', nullable: true })
  branchAddress?: string | null;

  @Column({ type: 'varchar', length: 15, nullable: true })
  branchPhone?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  branchEmail?: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  branchPhotoUrl?: string | null;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;

  @OneToMany(() => InvoiceEstimator, (ie) => ie.branch)
  invoiceEstimators: InvoiceEstimator[];

  @OneToMany(() => BranchLegalService, (ls) => ls.branch)
  legalServices: BranchLegalService[];
}
