import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProjectTrade } from './project-trade.entity';
import { InteriorProject } from './interior-project.entity';

@Entity('int_snag_items')
export class SnagItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  raisedAt: Date;

  @Column({ type: 'varchar', nullable: true, default: '' })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', nullable: true, default: '' })
  raisedBy: string | null;

  @Column({ type: 'varchar', nullable: true, default: 'medium' })
  severity: string | null;

  @Column({ type: 'varchar', nullable: true, default: 'open' })
  status: string | null;

  @Column({ type: 'varchar', nullable: true })
  photoUrl: string | null;

  @Column({ type: 'text', nullable: true })
  resolutionNote: string | null;

  @Column({ type: 'varchar', nullable: true })
  resolvedBy: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  tradeId: string | null;

  @Column({ type: 'uuid', nullable: true })
  projectId: string | null;

  @ManyToOne(() => ProjectTrade, (t) => t.snagItems, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tradeId' })
  trade: ProjectTrade | null;

  @ManyToOne(() => InteriorProject, (p) => p.snagItems, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'projectId' })
  project: InteriorProject | null;
}
