import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ScopeTemplate } from './scope-template.entity';
import { DailyUpdate } from './daily-update.entity';
import { QcItem } from './qc-item.entity';
import { SnagItem } from './snag-item.entity';
import { ScopeMedia } from './scope-media.entity';

export enum ScopeStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
}

@Entity('bl_scopes_of_work')
export class ScopeOfWork {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  projectId: string;

  @ManyToOne(() => ScopeTemplate, (tpl) => tpl.scopes, {
    eager: true,
    nullable: false,
  })
  template: ScopeTemplate;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customName?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  assignedVendorName?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  assignedVendorPhone?: string | null;

  @Column({ type: 'float', default: 0 })
  overallProgress: number;

  @Column({
    type: 'enum',
    enum: ScopeStatus,
    default: ScopeStatus.NOT_STARTED,
  })
  status: ScopeStatus;

  @Column({ type: 'int', default: 10 })
  weightage: number;

  @Column({ type: 'date', nullable: true })
  plannedStartDate?: Date | null;

  @Column({ type: 'date', nullable: true })
  plannedEndDate?: Date | null;

  @Column({ type: 'date', nullable: true })
  actualStartDate?: Date | null;

  @Column({ type: 'date', nullable: true })
  actualEndDate?: Date | null;

  @Column({ type: 'text', nullable: true })
  scopeArea?: string | null;

  @OneToMany(() => DailyUpdate, (update) => update.scope)
  dailyUpdates: DailyUpdate[];

  @OneToMany(() => QcItem, (item) => item.scope)
  qcItems: QcItem[];

  @OneToMany(() => SnagItem, (snag) => snag.scope)
  snagItems: SnagItem[];

  @OneToMany(() => ScopeMedia, (media) => media.scope)
  media: ScopeMedia[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

