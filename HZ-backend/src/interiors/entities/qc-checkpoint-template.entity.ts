import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { TradeTemplate } from './trade-template.entity';

@Entity('int_qc_checkpoint_templates')
export class QcCheckpointTemplate extends BaseEntity {
  @Column({ type: 'varchar', nullable: true })
  checkpointName: string | null;

  @Column({ type: 'boolean', default: true })
  isMandatory: boolean;

  @Column({ type: 'int', default: 0 })
  sequence: number;

  @Column({ type: 'uuid', nullable: true })
  tradeTemplateId: string | null;

  @ManyToOne(() => TradeTemplate, (template) => template.checkpoints, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tradeTemplateId' })
  tradeTemplate: TradeTemplate | null;
}
