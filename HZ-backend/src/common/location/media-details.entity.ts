import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Project } from 'src/company-onboarding/entities/company-projects.entity';

@Entity()
export class MediaDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('simple-array')
  propertyImages: string[];

  @Column('simple-array')
  propertyVideo: string[];

  @OneToOne(() => Project, (project) => project.mediaDetails)
  project: Project;
}
