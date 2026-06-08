import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LivebuildProject } from './livebuild-project.entity';

@Entity('livebuild_property_info')
export class LivebuildPropertyInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'project_id', type: 'int', unique: true })
  projectId: number;

  @OneToOne(() => LivebuildProject, (p) => p.propertyInfo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: LivebuildProject;

  @Column({ name: 'flat_number', type: 'varchar', length: 100, nullable: true })
  flatNumber: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tower: string | null;

  @Column({ name: 'total_area_sqft', type: 'int', nullable: true })
  totalAreaSqft: number | null;

  @Column({ name: 'carpet_area_sqft', type: 'int', nullable: true })
  carpetAreaSqft: number | null;

  @Column({ name: 'balcony_sqft', type: 'int', nullable: true })
  balconySqft: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  floor: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  facing: string | null;

  @Column({ name: 'design_scope', type: 'text', nullable: true })
  designScope: string | null;

  @Column({ name: 'super_built_up_sqft', type: 'int', nullable: true })
  superBuiltUpSqft: number | null;

  @Column({ name: 'scope_included', type: 'jsonb', nullable: true })
  scopeIncluded: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  specifications: { label: string; value: string }[] | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
