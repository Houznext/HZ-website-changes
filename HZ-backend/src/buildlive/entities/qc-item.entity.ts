import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ScopeOfWork } from './scope-of-work.entity';

export enum QcStatus {
  PENDING = 'pending',
  PASS = 'pass',
  FAIL = 'fail',
  SKIPPED = 'skipped',
}

@Entity('bl_qc_items')
export class QcItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ScopeOfWork, (scope) => scope.qcItems, {
    onDelete: 'CASCADE',
  })
  scope: ScopeOfWork;

  @Column({ type: 'varchar', length: 255 })
  checkpointName: string;

  @Column({
    type: 'enum',
    enum: QcStatus,
    default: QcStatus.PENDING,
  })
  status: QcStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  checkedBy?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  checkedAt?: Date | null;

  @Column({ type: 'text', nullable: true })
  failureNote?: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  photoUrl?: string | null;

  @Column({ type: 'int', default: 0 })
  sequence: number;

  @Column({ type: 'bool', default: true })
  isMandatory: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

