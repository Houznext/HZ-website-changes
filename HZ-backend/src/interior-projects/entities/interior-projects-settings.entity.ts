import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('interior_projects_settings')
export class InteriorProjectsSettings {
  @PrimaryColumn({ default: 1 })
  id: number;

  /** When set, shown as Total projects in CMS (and public stats). Null = use actual DB count. */
  @Column({ name: 'display_total_projects', type: 'int', nullable: true })
  displayTotalProjects: number | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
