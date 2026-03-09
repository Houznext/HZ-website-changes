import { BranchRole } from 'src/branchRole/entities/branch-role.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';

@Entity('branch_role_permissions')
@Index(['resource', 'branchRole'], { unique: true })
export class BranchRolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() resource: string;
  // 'property','interiors','customBuilder', etc.
  @Column({ default: false })
  view: boolean;
  @Column({ default: false })
  create: boolean;
  @Column({ default: false })
  edit: boolean;
  @Column({ default: false })
  delete: boolean;

  @ManyToOne(() => BranchRole, (br) => br.permissions, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: "branchRoleId" })
  branchRole: BranchRole;
}
