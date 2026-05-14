import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { InfraUserKind, InfraUserRole, InfraIndianState } from '../../auth/enum/infra-user.enum';
import { InfraUserBranchMembership } from '../../infra-branch/entities/infra-user-branch-membership.entity';
import { InfraBranch } from '../../infra-branch/entities/infra-branch.entity';

@Entity('infra_users')
export class InfraUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  username: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  profile: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  lastName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  email: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone: string | null;

  @Column({ nullable: true, default: false })
  isVerified: boolean;

  @Column({ type: 'enum', enum: InfraUserKind, default: InfraUserKind.STAFF })
  kind: InfraUserKind;

  @Column({ type: 'enum', enum: InfraUserRole, default: InfraUserRole.STANDARD })
  role: InfraUserRole;

  @Column({ type: 'simple-array', nullable: true })
  states: InfraIndianState[] | null;

  @ManyToOne(() => InfraBranch, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'currentBranchId' })
  currentBranch: InfraBranch | null;

  @OneToMany(() => InfraUserBranchMembership, (m) => m.user)
  branchMemberships: InfraUserBranchMembership[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordResetToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
