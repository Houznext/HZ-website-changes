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
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Branch } from './branch.entity';
import { BranchRole } from 'src/branchRole/entities/branch-role.entity';

@Entity()
@Unique(['user', 'branch'])
export class UserBranchMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.branchMemberships, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  branch: Branch;

  // Assign branch-scoped roles to this user for THIS branch
  @ManyToMany(() => BranchRole, { eager: true })
  @JoinTable({
    name: 'user_branch_membership_roles',
    joinColumn: { name: 'membership_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'branch_role_id', referencedColumnName: 'id' },
  })
  branchRoles: BranchRole[];

  @Column({ default: false })
  isBranchHead: boolean;

  @Column({ default: false })
  isPrimary: boolean;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
