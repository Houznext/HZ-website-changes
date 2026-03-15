import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { DailyUpdate } from './daily-update.entity';

@Entity('int_labour_entries')
export class LabourEntry extends BaseEntity {
  @Column({ type: 'varchar', nullable: true, default: '' })
  tradeType: string | null;

  @Column({ type: 'int', nullable: true, default: 0 })
  count: number | null;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  hoursWorked: number | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  wagePerDay: number | null;

  @Column({ type: 'uuid', nullable: true })
  dailyUpdateId: string | null;

  @ManyToOne(() => DailyUpdate, (d) => d.labourEntries, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'dailyUpdateId' })
  dailyUpdate: DailyUpdate | null;
}
