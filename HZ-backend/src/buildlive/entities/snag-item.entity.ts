import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ScopeOfWork } from './scope-of-work.entity';

export enum SnagSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum SnagStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
}

@Entity('bl_snag_items')
export class SnagItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ScopeOfWork, (scope) => scope.snagItems, {
    onDelete: 'CASCADE',
  })
  scope: ScopeOfWork;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  raisedBy: string;

  @Column({
    type: 'enum',
    enum: SnagSeverity,
    default: SnagSeverity.MEDIUM,
  })
  severity: SnagSeverity;

  @Column({
    type: 'enum',
    enum: SnagStatus,
    default: SnagStatus.OPEN,
  })
  status: SnagStatus;

  @Column({ type: 'varchar', length: 512, nullable: true })
  photoUrl?: string | null;

  @Column({ type: 'text', nullable: true })
  resolutionNote?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resolvedBy?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date | null;

  @CreateDateColumn()
  raisedAt: Date;
}

