import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InteriorProject } from './interior-project.entity';

@Entity('int_project_documents')
export class ProjectDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', nullable: true, default: '' })
  category: string | null;

  @Column({ type: 'varchar', nullable: true, default: '' })
  documentName: string | null;

  @Column({ type: 'varchar', nullable: true, default: '' })
  s3Url: string | null;

  @Column({ type: 'varchar', nullable: true, default: '' })
  uploadedBy: string | null;

  @Column({ type: 'int', nullable: true })
  fileSize: number | null;

  @Column({ type: 'date', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  projectId: string | null;

  @ManyToOne(() => InteriorProject, (p) => p.documents, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'projectId' })
  project: InteriorProject | null;
}
