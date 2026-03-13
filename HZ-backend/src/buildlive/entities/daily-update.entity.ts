import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { ScopeOfWork } from './scope-of-work.entity';
import { LabourEntry } from './labour-entry.entity';
import { MaterialUsage } from './material-usage.entity';

@Entity('bl_daily_updates')
export class DailyUpdate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ScopeOfWork, (scope) => scope.dailyUpdates, {
    onDelete: 'CASCADE',
  })
  scope: ScopeOfWork;

  @Column({ type: 'date' })
  updateDate: Date;

  @Column({ type: 'float' })
  progressDelta: number;

  @Column({ type: 'float' })
  cumulativeProgress: number;

  @Column({ type: 'varchar', length: 255 })
  supervisorName: string;

  @Column({ type: 'text', nullable: true })
  workDoneToday?: string | null;

  @Column({ type: 'text', nullable: true })
  tomorrowPlan?: string | null;

  @Column({ type: 'text', nullable: true })
  blockerNote?: string | null;

  @Column({ type: 'float', default: 0 })
  totalExpenditureToday: number;

  @OneToMany(() => LabourEntry, (entry) => entry.dailyUpdate)
  labourEntries: LabourEntry[];

  @OneToMany(() => MaterialUsage, (usage) => usage.dailyUpdate)
  materialUsages: MaterialUsage[];

  @CreateDateColumn()
  createdAt: Date;
}

