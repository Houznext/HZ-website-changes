import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Project } from './company-projects.entity';
import { Award } from '../Awards/entity/company-awards.entity';
import { User } from 'src/user/entities/user.entity';
import { LocationDetails } from 'src/property/entities/location.entity';

@Entity()
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyName: string;

  @OneToMany(() => LocationDetails, (address) => address.company, {
    cascade: true,
  })
  locatedIn: LocationDetails[];

  @Column()
  RERAId: string;

  @Column('simple-array', { default: '' })
  Logo: string[];

  @Column()
  estdYear: number;

  @Column('text')
  about: string;

  @OneToMany(() => Award, (award) => award.company, {
  cascade: true,
})
  awards: Award[];

  @OneToOne(() => User, (user) => user.company, { cascade: true })
  @JoinColumn()
  developerInformation: User;

  @OneToMany(() => Project, (project) => project.company, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  projects: Project[];

  @Column('text', { array: true, nullable: true })
  promotionType: string[];

  @Column({ type: 'timestamp', nullable: true })
  promotionExpiry?: Date;

  @Column({ type: 'simple-array', nullable: true })
  promotionTags: string[];

  @Column({ nullable: true })
  updatedBy: string;

  // Approval workflow fields
  @Column({ default: false })
  isPosted: boolean;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  createdAt: Date;
}
