import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LivebuildProject } from './livebuild-project.entity';
import { LivebuildRoom } from './livebuild-room.entity';
import { LivebuildWorkType } from './livebuild-work-type.entity';

@Entity('livebuild_materials')
export class LivebuildMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'project_id', type: 'int' })
  projectId: number;

  @ManyToOne(() => LivebuildProject, (p) => p.materials, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: LivebuildProject;

  @Column({ name: 'room_id', type: 'int', nullable: true })
  roomId: number | null;

  @ManyToOne(() => LivebuildRoom, { nullable: true })
  @JoinColumn({ name: 'room_id' })
  room: LivebuildRoom | null;

  @Column({ name: 'work_type_id', type: 'int', nullable: true })
  workTypeId: number | null;

  @ManyToOne(() => LivebuildWorkType, { nullable: true })
  @JoinColumn({ name: 'work_type_id' })
  workType: LivebuildWorkType | null;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column({ type: 'text', nullable: true })
  specification: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  brand: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  quantity: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string | null;

  @Column({ type: 'varchar', length: 30, default: 'started' })
  status: string;

  @Column({ name: 'install_date', type: 'date', nullable: true })
  installDate: string | null;

  @Column({ name: 'warranty_period', type: 'varchar', length: 50, nullable: true })
  warrantyPeriod: string | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
