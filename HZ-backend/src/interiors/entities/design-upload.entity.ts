import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InteriorProject } from './interior-project.entity';

@Entity('int_design_uploads')
export class DesignUpload {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', nullable: true, default: '' })
  roomTag: string | null;

  @Column({ type: 'varchar', nullable: true, default: '' })
  s3Url: string | null;

  @Column({ type: 'varchar', nullable: true, default: 'full' })
  designType: string | null;

  @Column({ type: 'text', nullable: true })
  designNotes: string | null;

  @Column({ type: 'varchar', nullable: true, default: '' })
  uploadedBy: string | null;

  @Column({ type: 'int', nullable: true, default: 1 })
  version: number | null;

  @Column({ type: 'uuid', nullable: true })
  projectId: string | null;

  @ManyToOne(() => InteriorProject, (p) => p.designUploads, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'projectId' })
  project: InteriorProject | null;
}
