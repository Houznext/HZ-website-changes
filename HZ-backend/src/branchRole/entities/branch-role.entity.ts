import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { Branch } from 'src/branch/entities/branch.entity';
import { BranchRolePermission } from 'src/branch-role-permission/entities/branch-role.-permission.entity';
@Entity('branch_roles')
@Index(['branch', 'roleName'], { unique: true })
export class BranchRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Branch, (b) => b.branchRoles, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: "branchId" })
  branch: Branch;

  @Column()
  roleName: string;

  @Column({ default: false })
  isBranchHead: boolean; // role-level flag if this role is considered a head role

  @OneToMany(() => BranchRolePermission, (p) => p.branchRole, {
    cascade: true,
    eager: true,
  })
  permissions: BranchRolePermission[];
}
