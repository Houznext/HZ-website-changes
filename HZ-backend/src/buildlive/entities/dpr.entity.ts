import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('bl_daily_progress_reports')
export class Dpr {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  projectId: string;

  @Column({ type: 'date' })
  reportDate: Date;

  @Column({ type: 'jsonb' })
  reportData: any;

  @Column({ type: 'varchar', length: 512, nullable: true })
  pdfS3Url?: string | null;

  @Column({ type: 'bool', default: false })
  sentToCustomer: boolean;

  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date | null;

  @CreateDateColumn()
  generatedAt: Date;
}

