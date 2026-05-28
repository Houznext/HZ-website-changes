import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LivebuildProject } from './livebuild-project.entity';
import { LivebuildRoom } from './livebuild-room.entity';
import { LivebuildWorkType } from './livebuild-work-type.entity';
import { LivebuildDprPhoto } from './livebuild-dpr-photo.entity';

@Entity('livebuild_dpr')
export class LivebuildDpr {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'project_id', type: 'int' })
  projectId: number;

  @ManyToOne(() => LivebuildProject, (p) => p.dprEntries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: LivebuildProject;

  @Column({ name: 'room_id', type: 'int' })
  roomId: number;

  @ManyToOne(() => LivebuildRoom, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: LivebuildRoom;

  @Column({ name: 'work_type_id', type: 'int' })
  workTypeId: number;

  @ManyToOne(() => LivebuildWorkType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'work_type_id' })
  workType: LivebuildWorkType;

  @Column({ name: 'report_date', type: 'date' })
  reportDate: string;

  @Column({ name: 'pct_today', type: 'int', nullable: true })
  pctToday: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'done_today', type: 'boolean', default: false })
  doneToday: boolean;

  @Column({ name: 'submitted_by', type: 'varchar', length: 255, nullable: true })
  submittedBy: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => LivebuildDprPhoto, (p) => p.dpr)
  photos: LivebuildDprPhoto[];
}
