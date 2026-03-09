import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DailyProgress } from 'src/Custombuilder/daily-progress/entities/daily-progress.entity';
import { CustomBuilder } from '../../entities/custom-builder.entity';

@Entity()
@Index(['customBuilder', 'order'])
export class Phase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  order: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'int', default: 0 })
  plannedDays: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  plannedCost: number | null;

  @Column({ type: 'date', nullable: true })
  plannedStart: Date | null;

  @Column({ type: 'date', nullable: true })
  plannedEnd: Date | null;

  @Column({ type: 'int', default: 0 })
  actualDays: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  actualCost: number;

  @ManyToOne(() => CustomBuilder, (cb) => cb.phases, { onDelete: 'CASCADE' })
  customBuilder: CustomBuilder;

  @OneToMany(() => DailyProgress, (log) => log.phase)
  logs: DailyProgress[];

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
