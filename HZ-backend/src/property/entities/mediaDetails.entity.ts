import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Property } from './property.entity';
import { Project } from 'src/company-onboarding/entities/company-projects.entity';

@Entity()
export class MediaDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('simple-array')
  propertyImages: string[];

  @Column('simple-array')
  propertyVideo: string[];

  @OneToOne(() => Property, (property) => property.mediaDetails)
  property: Property;

  @OneToOne(() => Project, (project) => project.mediaDetails)
  project: Project;
}
