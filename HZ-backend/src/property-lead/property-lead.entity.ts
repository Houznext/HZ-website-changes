import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '../company-onboarding/entities/company-projects.entity';

@Entity()
export class PropertyLead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column()
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  interestedInLoan: boolean;

  @Column({ default: false, nullable: true })
  agreeToContact: boolean;

  @ManyToOne(() => Project, (project) => project.leads, {
    onDelete: 'CASCADE',
  })
  project: Project;
}
