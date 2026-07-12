import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Project } from 'src/company-onboarding/entities/company-projects.entity';

@Entity()
export class ConstructionStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['Ready to Move', 'Under Construction', 'Newly Launched'],
    nullable: true,
  })
  status: string;

  @Column({ type: 'int', nullable: true })
  ageOfProperty: number;

  @Column({ type: 'int', nullable: true })
  possessionYears: number;

  @Column({ type: 'date', nullable: true })
  possessionBy: Date;

  @Column({ type: 'date', nullable: true })
  launchedDate?: Date;

  @OneToOne(() => Project, (project) => project.constructionStatus)
  project: Project;
}
