import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { InfraBranchLevel, InfraBranchCategory } from '../enum/infra-branch.enum';
import { InfraBranchRole } from '../../infra-branch-role/entities/infra-branch-role.entity';

@Entity('infra_branches')
export class InfraBranch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: InfraBranchLevel })
  level: InfraBranchLevel;

  @ManyToOne(() => InfraBranch, (b) => b.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentId' })
  parent: InfraBranch | null;

  @OneToMany(() => InfraBranch, (b) => b.parent)
  children: InfraBranch[];

  @Index()
  @Column({ type: 'varchar', length: 512 })
  path: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isHeadOffice: boolean;

  @Column({ default: false })
  isStateHQ: boolean;

  @Column({ nullable: true, type: 'uuid' })
  createdById: string | null;

  @Column({ type: 'enum', enum: InfraBranchCategory, nullable: true })
  category: InfraBranchCategory | null;

  @Column({ type: 'int', nullable: true })
  stateId: number | null;

  @Column({ type: 'int', nullable: true })
  cityId: number | null;

  @Column({ type: 'varchar', length: 12, nullable: true })
  ownerAadhaarNumber: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  ownerPanNumber: string | null;

  @Column({ type: 'varchar', length: 15, nullable: true })
  ownerGstNumber: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  ownerPhotoUrl: string | null;

  @Column({ type: 'date', nullable: true })
  ownerDateOfBirth: Date | null;

  @Column({ type: 'text', nullable: true })
  ownerAddress: string | null;

  @Column({ type: 'text', nullable: true })
  branchAddress: string | null;

  @Column({ type: 'varchar', length: 15, nullable: true })
  branchPhone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  branchEmail: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  branchPhotoUrl: string | null;

  @Column({ default: false })
  hasFranchiseFeePaid: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  franchisePaymentRef: string | null;

  @OneToMany(() => InfraBranchRole, (r) => r.branch, { cascade: true })
  branchRoles: InfraBranchRole[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
