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
import { Livebuild3dHotspot } from './livebuild-3d-hotspot.entity';

@Entity('livebuild_3d_models')
export class Livebuild3dModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'project_id', type: 'int' })
  projectId: number;

  @ManyToOne(() => LivebuildProject, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: LivebuildProject;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ name: 'model_type', type: 'varchar', length: 30, default: 'full_home' })
  modelType: string;

  @Column({ name: 'floor_number', type: 'int', nullable: true })
  floorNumber: number | null;

  @Column({ name: 'room_id', type: 'int', nullable: true })
  roomId: number | null;

  @ManyToOne(() => LivebuildRoom, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'room_id' })
  room: LivebuildRoom | null;

  @Column({ name: 'file_url', type: 'text' })
  fileUrl: string;

  @Column({ name: 'file_name', type: 'varchar', length: 255, nullable: true })
  fileName: string | null;

  @Column({ name: 'file_size_bytes', type: 'bigint', nullable: true })
  fileSizeBytes: number | null;

  @Column({ name: 'file_format', type: 'varchar', length: 20, default: 'glb' })
  fileFormat: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ name: 'camera_pos_x', type: 'double precision', nullable: true })
  cameraPosX: number | null;

  @Column({ name: 'camera_pos_y', type: 'double precision', nullable: true })
  cameraPosY: number | null;

  @Column({ name: 'camera_pos_z', type: 'double precision', nullable: true })
  cameraPosZ: number | null;

  @Column({ name: 'camera_target_x', type: 'double precision', nullable: true })
  cameraTargetX: number | null;

  @Column({ name: 'camera_target_y', type: 'double precision', nullable: true })
  cameraTargetY: number | null;

  @Column({ name: 'camera_target_z', type: 'double precision', nullable: true })
  cameraTargetZ: number | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => Livebuild3dHotspot, (h) => h.model)
  hotspots: Livebuild3dHotspot[];
}
