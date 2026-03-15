import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { QcCheckpointTemplate } from './qc-checkpoint-template.entity';

@Entity('int_trade_templates')
export class TradeTemplate extends BaseEntity {
  @Column({ type: 'varchar', nullable: true, default: '' })
  name: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  slug: string | null;

  @Column({ type: 'varchar', nullable: true, default: 'Wrench' })
  iconName: string | null;

  @Column({ type: 'varchar', nullable: true, default: 'nos' })
  unit: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, default: 10 })
  defaultWeightage: number | null;

  @Column({ type: 'int', nullable: true, default: 0 })
  sortOrder: number | null;

  @Column({ type: 'boolean', nullable: true, default: true })
  isActive: boolean | null;

  @Column({ type: 'boolean', nullable: true, default: false })
  isCustom: boolean | null;

  @OneToMany(() => QcCheckpointTemplate, (cp) => cp.tradeTemplate, { cascade: ['insert', 'update'] })
  checkpoints: QcCheckpointTemplate[];
}
