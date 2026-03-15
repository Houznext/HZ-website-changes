import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ProjectTrade } from './project-trade.entity';

@Entity('int_qc_items')
export class QcItem extends BaseEntity {
  @Column({ type: 'varchar', nullable: true, default: '' })
  checkpointName: string | null;

  @Column({ type: 'varchar', nullable: true, default: 'pending' })
  status: string | null;

  @Column({ type: 'varchar', nullable: true })
  checkedBy: string | null;

  @Column({ type: 'timestamp', nullable: true })
  checkedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  failureNote: string | null;

  @Column({ type: 'varchar', nullable: true })
  photoUrl: string | null;

  @Column({ type: 'int', nullable: true, default: 0 })
  sequence: number | null;

  @Column({ type: 'boolean', nullable: true, default: true })
  isMandatory: boolean | null;

  @Column({ type: 'uuid', nullable: true })
  tradeId: string | null;

  @ManyToOne(() => ProjectTrade, (t) => t.qcItems, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tradeId' })
  trade: ProjectTrade | null;
}
