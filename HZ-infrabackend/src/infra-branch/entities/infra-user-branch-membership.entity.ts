import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { InfraUser } from '../../infra-user/entities/infra-user.entity';
import { InfraBranch } from './infra-branch.entity';
import { InfraBranchRole } from '../../infra-branch-role/entities/infra-branch-role.entity';

@Entity('infra_user_branch_memberships')
@Unique(['user', 'branch'])
export class InfraUserBranchMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => InfraUser, (u) => u.branchMemberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: InfraUser;

  @ManyToOne(() => InfraBranch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  branch: InfraBranch;

  @ManyToMany(() => InfraBranchRole, { eager: true })
  @JoinTable({
    name: 'infra_user_branch_membership_roles',
    joinColumn: { name: 'membership_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'branch_role_id', referencedColumnName: 'id' },
  })
  branchRoles: InfraBranchRole[];

  @Column({ default: false })
  isBranchHead: boolean;

  @Column({ default: false })
  isPrimary: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
