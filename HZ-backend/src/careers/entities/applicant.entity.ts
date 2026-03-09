import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Career } from './career.entity';
import { ApplicationStatus } from '../enum/applicationStatus.enum';

@Entity()
export class Applicant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  linkedin: string;

  @Column({ nullable: true })
  github: string;

  @Column({ nullable: true })
  resume: string; // URL or file path to resume

  @Column('simple-json', { nullable: true })
  qualifications: {
    degree: string;
    institution: string;
    yearOfCompletion: string;
  }[];

  @Column('simple-json', { nullable: true })
  workExperience: {
    company: string;
    role: string;
    duration: string; // e.g., "2 years", or "June 2020 - July 2022"
    description: string;
  }[];

  // @Column({ nullable: true })
  // skillsApiUrl: string; // External API endpoint for fetching skills

  @ManyToOne(() => Career, (career) => career.applicants)
  career: Career;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus; // Enum for application status
}
