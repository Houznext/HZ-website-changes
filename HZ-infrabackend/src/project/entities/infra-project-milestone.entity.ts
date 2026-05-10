import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { InfraProject } from './infra-project.entity';

@Entity('infra_project_milestone')
export class InfraProjectMilestone {
  @PrimaryGeneratedColumn('uuid')
  milestoneId: string;

  @Column()
  label: string;

  @Column({ type: 'varchar', nullable: true })
  date: string | null;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: false })
  isCurrent: boolean;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ default: 0 })
  sortOrder: number;

  @ManyToOne(() => InfraProject, (p) => p.milestones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: InfraProject;
}
