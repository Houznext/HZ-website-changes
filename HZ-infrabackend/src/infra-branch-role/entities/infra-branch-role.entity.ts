import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { InfraBranch } from '../../infra-branch/entities/infra-branch.entity';
import { InfraBranchRolePermission } from '../../infra-branch-role-permission/entities/infra-branch-role-permission.entity';

@Entity('infra_branch_roles')
@Unique(['branch', 'roleName'])
export class InfraBranchRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => InfraBranch, (b) => b.branchRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  branch: InfraBranch;

  @Column()
  roleName: string;

  @Column({ default: false })
  isBranchHead: boolean;

  @OneToMany(() => InfraBranchRolePermission, (p) => p.branchRole, { cascade: true, eager: true })
  permissions: InfraBranchRolePermission[];
}
