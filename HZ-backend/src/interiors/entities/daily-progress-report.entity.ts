import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InteriorProject } from './interior-project.entity';

@Entity('int_dpr')
export class DailyProgressReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  generatedAt: Date;

  @Column({ type: 'date', nullable: true })
  reportDate: Date | null;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  reportData: Record<string, unknown> | null;

  @Column({ type: 'varchar', nullable: true })
  pdfS3Url: string | null;

  @Column({ type: 'boolean', nullable: true, default: false })
  sentToCustomer: boolean | null;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  projectId: string | null;

  @ManyToOne(() => InteriorProject, (p) => p.dailyProgressReports, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'projectId' })
  project: InteriorProject | null;
}
