import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { CRMLead } from './crm.entity';
import { LeadStatus } from '../enums/crm.enum';
import { User } from 'src/user/entities/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';

@Entity('crm_lead_status_log')
@Index(['lead', 'changedAt'])
@Index(['branchId', 'changedAt'])
export class LeadStatusLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CRMLead, (lead) => lead.statusLogs, { onDelete: 'CASCADE' })
  lead: CRMLead;

  @Column({
    type: 'enum',
    enum: LeadStatus,
  })
  status: LeadStatus;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  changedAt: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  changeReason?: string;

  @ManyToOne(() => User, { nullable: true })
  changedBy?: User;

  @Column({ type: 'uuid', nullable: true })
  branchId: string;

  @ManyToOne(() => Branch, { nullable: false })
  branch: Branch;
}
