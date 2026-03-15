import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProjectTrade } from './project-trade.entity';

@Entity('int_trade_media')
export class TradeMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'uuid', nullable: true })
  dailyUpdateId: string | null;

  @Column({ type: 'varchar', nullable: true, default: '' })
  s3Url: string | null;

  @Column({ type: 'varchar', nullable: true, default: 'photo' })
  mediaType: string | null;

  @Column({ type: 'varchar', nullable: true })
  caption: string | null;

  @Column({ type: 'varchar', nullable: true, default: '' })
  uploadedBy: string | null;

  @Column({ type: 'varchar', nullable: true })
  tradeTag: string | null;

  @Column({ type: 'varchar', nullable: true })
  stageTag: string | null;

  @Column({ type: 'timestamp', nullable: true })
  takenAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  tradeId: string | null;

  @ManyToOne(() => ProjectTrade, (t) => t.media, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tradeId' })
  trade: ProjectTrade | null;
}
