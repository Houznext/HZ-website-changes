import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { ProjectTrade } from './project-trade.entity';
import { InteriorProject } from './interior-project.entity';
import { LabourEntry } from './labour-entry.entity';
import { MaterialUsage } from './material-usage.entity';

@Entity('int_daily_updates')
export class DailyUpdate extends BaseEntity {
  @Column({ type: 'date', nullable: true })
  updateDate: Date | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, default: 0 })
  progressDelta: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, default: 0 })
  cumulativeProgress: number | null;

  @Column({ type: 'varchar', nullable: true })
  supervisorName: string | null;

  @Column({ type: 'varchar', nullable: true })
  stageLabel: string | null;

  @Column({ type: 'text', nullable: true })
  workDoneToday: string | null;

  @Column({ type: 'text', nullable: true })
  tomorrowPlan: string | null;

  @Column({ type: 'text', nullable: true })
  blockerNote: string | null;

  @Column({ type: 'int', nullable: true })
  labourCount: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalExpenditureToday: number | null;

  @Column({ type: 'uuid', nullable: true })
  tradeId: string | null;

  @Column({ type: 'uuid', nullable: true })
  projectId: string | null;

  @ManyToOne(() => ProjectTrade, (t) => t.dailyUpdates, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tradeId' })
  trade: ProjectTrade | null;

  @ManyToOne(() => InteriorProject, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'projectId' })
  project: InteriorProject | null;

  @OneToMany(() => LabourEntry, (l) => l.dailyUpdate, { cascade: ['insert', 'remove'] })
  labourEntries: LabourEntry[];

  @OneToMany(() => MaterialUsage, (m) => m.dailyUpdate, { cascade: ['insert', 'remove'] })
  materialUsages: MaterialUsage[];
}
