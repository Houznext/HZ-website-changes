import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LivebuildDpr } from './livebuild-dpr.entity';

@Entity('livebuild_dpr_photos')
export class LivebuildDprPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'dpr_id', type: 'int' })
  dprId: number;

  @ManyToOne(() => LivebuildDpr, (d) => d.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dpr_id' })
  dpr: LivebuildDpr;

  @Column({ name: 'file_url', type: 'text' })
  fileUrl: string;

  @Column({ name: 'file_name', type: 'varchar', length: 255, nullable: true })
  fileName: string | null;

  @Column({ name: 'file_size', type: 'int', nullable: true })
  fileSize: number | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
