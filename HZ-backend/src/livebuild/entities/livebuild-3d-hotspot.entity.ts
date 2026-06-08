import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Livebuild3dModel } from './livebuild-3d-model.entity';
import { LivebuildRoom } from './livebuild-room.entity';

@Entity('livebuild_3d_hotspots')
export class Livebuild3dHotspot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'model_id', type: 'int' })
  modelId: number;

  @ManyToOne(() => Livebuild3dModel, (m) => m.hotspots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'model_id' })
  model: Livebuild3dModel;

  @Column({ name: 'room_id', type: 'int', nullable: true })
  roomId: number | null;

  @ManyToOne(() => LivebuildRoom, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'room_id' })
  room: LivebuildRoom | null;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ name: 'position_x', type: 'double precision', default: 0 })
  positionX: number;

  @Column({ name: 'position_y', type: 'double precision', default: 0 })
  positionY: number;

  @Column({ name: 'position_z', type: 'double precision', default: 0 })
  positionZ: number;

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
}
