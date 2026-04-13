
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index,
  CreateDateColumn, UpdateDateColumn, JoinColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { CustomBuilder } from '../entities/custom-builder.entity';
import { DailyProgress } from '../daily-progress/entities/daily-progress.entity';
import { Phase } from '../phase/entities/phase.entity';
import { CBDocumentType, BillCategory } from '../enum/custom-builder.enum';

@Entity()
@Index(['customBuilder', 'type'])
export class CBDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CustomBuilder, (cb) => cb.documents, { onDelete: 'CASCADE' })
  @JoinColumn()
  customBuilder: CustomBuilder;

  
  @ManyToOne(() => Phase, { nullable: true, onDelete: 'SET NULL' })
  phase?: Phase;

  @ManyToOne(() => DailyProgress, { nullable: true, onDelete: 'SET NULL' })
  dayLog?: DailyProgress;

  @Column({  type: 'varchar' })
  type: string;


  @Column({ type: 'text' })
  fileUrl: string;

  
  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  uploadedBy?: User;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  
  @Column({ type: 'date', nullable: true })
  documentDate?: string;

 
  @Column({ type: 'jsonb', nullable: true })
  meta?: {
    category?: BillCategory;
    amount?: number;         
    vendor?: string;
    referenceNo?: string;    
    paidVia?: 'cash' | 'upi' | 'card' | 'bank' | 'cheque' | 'other';
    gstNo?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  
}
