import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { InfraBranchRole } from '../../infra-branch-role/entities/infra-branch-role.entity';

@Entity('infra_branch_role_permissions')
@Unique(['resource', 'branchRole'])
export class InfraBranchRolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  resource: string;

  @Column({ default: false })
  view: boolean;

  @Column({ default: false })
  create: boolean;

  @Column({ default: false })
  edit: boolean;

  @Column({ default: false })
  delete: boolean;

  @ManyToOne(() => InfraBranchRole, (br) => br.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchRoleId' })
  branchRole: InfraBranchRole;
}
