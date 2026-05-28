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
import { LivebuildRoomWorkType } from './livebuild-room-work-type.entity';

@Entity('livebuild_rooms')
export class LivebuildRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'project_id', type: 'int' })
  projectId: number;

  @ManyToOne(() => LivebuildProject, (p) => p.rooms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: LivebuildProject;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'room_type', type: 'varchar', length: 100, nullable: true })
  roomType: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  dimensions: string | null;

  @Column({ type: 'int', default: 0 })
  pct: number;

  @Column({ type: 'varchar', length: 20, default: 'live' })
  status: string;

  @Column({ name: 'hold_reason', type: 'text', nullable: true })
  holdReason: string | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => LivebuildRoomWorkType, (rwt) => rwt.room)
  roomWorkTypes: LivebuildRoomWorkType[];
}
