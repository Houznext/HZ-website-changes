import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { DailyUpdate } from './daily-update.entity';

@Entity('bl_labour_entries')
export class LabourEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DailyUpdate, (update) => update.labourEntries, {
    onDelete: 'CASCADE',
  })
  dailyUpdate: DailyUpdate;

  @Column({ type: 'varchar', length: 100 })
  tradeType: string;

  @Column({ type: 'int' })
  count: number;

  @Column({ type: 'float', default: 8 })
  hoursWorked: number;

  @Column({ type: 'float', nullable: true })
  wagePerDay?: number | null;
}

