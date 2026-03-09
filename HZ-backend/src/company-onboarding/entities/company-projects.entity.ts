import { MediaDetails } from 'src/property/entities/mediaDetails.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { ConstructionStatus } from 'src/property/entities/property-details/constructionStatus.entity';
import { PropertyType } from './project-property-type.entity';
import { LocationDetails } from 'src/property/entities/location.entity';
import { User } from 'src/user/entities/user.entity';
import { SizeWithUnit } from '../Interfaces/size.interface';
import { PropertyLead } from '../../property/propertyLead/property-lead.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  Name: string;

  @Column('text')
  Description: string;

  @Column({ default: false })
  isBrokerage: boolean;

  @Column('text')
  Highlights: string;

  @Column('jsonb')
  ProjectArea: SizeWithUnit;

  @Column({ nullable: true })
  unitName: string;

  @Column('jsonb')
  ProjectSize: SizeWithUnit;

  @Column('jsonb', { nullable: true })
  MinSize: SizeWithUnit;

  @Column('jsonb', { nullable: true })
  MaxSize: SizeWithUnit;

  @Column('text')
  Specifications: string;

  @Column('simple-array', { nullable: true })
  Brochure: string[];

  @Column('text')
  AboutProject: string;

  @Column('float')
  minPrice: number;

  @Column('float')
  maxPrice: number;

  @Column('simple-array')
  ProjectAmenities: string[];

  @Column('jsonb', { nullable: true })
  faqs: { question: string; answer: string }[];

  @Column('text', { array: true, nullable: true })
  promotionType: string[];

  @Column({ type: 'timestamp', nullable: true })
  promotionExpiry?: Date;

  @Column({ type: 'simple-array', nullable: true })
  promotionTags: string[];

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  // Approval workflow fields
  @Column({ default: false })
  isPosted: boolean;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ type: 'timestamp', nullable: true })
  approvedDate: Date;

  @OneToOne(() => LocationDetails, (location) => location.project)
  @JoinColumn()
  location: LocationDetails;

  @OneToOne(() => MediaDetails, (media) => media.project)
  @JoinColumn()
  mediaDetails: MediaDetails;

  @OneToOne(
    () => ConstructionStatus,
    (constructionStatus) => constructionStatus.project,
  )
  @JoinColumn()
  constructionStatus: ConstructionStatus;

  @ManyToOne(() => Company, (company) => company.projects)
  company: Company;

  @OneToOne(() => PropertyType, (propertyType) => propertyType.project)
  @JoinColumn()
  propertyType: PropertyType;

  @OneToMany(() => User, (user) => user.project, {
    cascade: true,
  })
  sellers: User[];
  @OneToMany(() => PropertyLead, (lead) => lead.project, { cascade: true })
  leads: PropertyLead[];

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt: Date;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  postedAt: Date;
}
