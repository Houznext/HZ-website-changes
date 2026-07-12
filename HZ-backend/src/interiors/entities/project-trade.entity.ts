import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { InteriorProject } from './interior-project.entity';
import { DailyUpdate } from './daily-update.entity';
import { QcItem } from './qc-item.entity';
import { SnagItem } from './snag-item.entity';
import { TradeMedia } from './trade-media.entity';

@Entity('int_project_trades')
export class ProjectTrade extends BaseEntity {
  @Column({ type: 'varchar', nullable: true })
  customName: string | null;

  @Column({ type: 'varchar', nullable: true })
  assignedVendorName: string | null;

  @Column({ type: 'varchar', nullable: true })
  assignedVendorPhone: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, default: 0 })
  overallProgress: number | null;

  @Column({ type: 'varchar', nullable: true, default: 'not_started' })
  status: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, default: 10 })
  weightage: number | null;

  @Column({ type: 'date', nullable: true })
  plannedStartDate: Date | null;

  @Column({ type: 'date', nullable: true })
  plannedEndDate: Date | null;

  @Column({ type: 'date', nullable: true })
  actualStartDate: Date | null;

  @Column({ type: 'date', nullable: true })
  actualEndDate: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  lastUpdatedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  projectId: string | null;

  @ManyToOne(() => InteriorProject, (p) => p.trades, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'projectId' })
  project: InteriorProject | null;

  @OneToMany(() => DailyUpdate, (u) => u.trade)
  dailyUpdates: DailyUpdate[];

  @OneToMany(() => QcItem, (q) => q.trade)
  qcItems: QcItem[];

  @OneToMany(() => SnagItem, (s) => s.trade)
  snagItems: SnagItem[];

  @OneToMany(() => TradeMedia, (m) => m.trade)
  media: TradeMedia[];
}
