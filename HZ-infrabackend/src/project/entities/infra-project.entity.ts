import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConstructionStatus, ProjectType } from '../../common/enums/infra.enums';
import { InfraProjectMilestone } from './infra-project-milestone.entity';

@Entity('infra_project')
export class InfraProject {
  @PrimaryGeneratedColumn('uuid')
  projectId: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  slug: string | null;

  @Column({ type: 'varchar', default: ProjectType.Apartment })
  projectType: ProjectType;

  @Column({ type: 'varchar', nullable: true })
  developerName: string | null;

  @Column({ type: 'varchar', nullable: true })
  refCode: string | null;

  @Column({ default: true })
  published: boolean;

  @Column({ default: true })
  showInSearch: boolean;

  @Column({ default: false })
  reraVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  city: string | null;

  @Column({ type: 'varchar', nullable: true })
  locality: string | null;

  @Column({ type: 'varchar', nullable: true })
  reraNumber: string | null;

  @Column({ type: 'int', nullable: true })
  totalUnits: number | null;

  @Column({ type: 'int', nullable: true })
  availableUnits: number | null;

  @Column({ type: 'int', nullable: true })
  towers: number | null;

  @Column({ type: 'int', nullable: true })
  maxFloors: number | null;

  @Column({ type: 'varchar', nullable: true })
  possessionDate: string | null;

  @Column({ type: 'enum', enum: ConstructionStatus })
  status: ConstructionStatus;

  @Column('decimal', { nullable: true, precision: 18, scale: 2 })
  minPrice: string | null;

  @Column('decimal', { nullable: true, precision: 18, scale: 2 })
  maxPrice: string | null;

  @Column({ type: 'varchar', nullable: true })
  pricePerUnitLabel: string | null;

  @Column({ type: 'varchar', nullable: true })
  unitsLabel: string | null;

  @Column({ type: 'varchar', nullable: true })
  configLabel: string | null;

  @Column({ type: 'int', default: 0 })
  bankCount: number;

  @Column({ type: 'int', default: 0 })
  enquiryCount: number;

  @Column({ type: 'varchar', nullable: true })
  gradientBg: string | null;

  @Column({ type: 'varchar', nullable: true })
  accentColor: string | null;

  @Column({ type: 'int', nullable: true })
  constructionProgress: number | null;

  @Column('simple-json', { nullable: true })
  approvedBanks: string[] | null;

  @Column('simple-json', { nullable: true })
  amenities: string[] | null;

  @Column('simple-json', { nullable: true })
  configurations:
    | {
        type: string;
        area?: string;
        basePrice?: string;
        allInclusive?: string;
        availability?: string;
      }[]
    | null;

  @Column('simple-json', { nullable: true })
  infrastructure:
    | {
        label: string;
        status: string;
      }[]
    | null;

  @Column('simple-json', { nullable: true })
  legal: Record<string, string> | null;

  @Column('simple-json', { nullable: true })
  roadWidths: { label: string; width: string }[] | null;

  @Column('simple-json', { nullable: true })
  landmarks: { name: string; distance: string }[] | null;

  @Column('simple-json', { nullable: true })
  faqs: { q: string; a: string }[] | null;

  @Column('simple-json', { nullable: true })
  developerInfo: {
    name?: string;
    founded?: string;
    location?: string;
    highlights?: string[];
  } | null;

  @Column({ type: 'varchar', default: 'published' })
  visibility: string;

  @Column('text', { nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  heroImageUrl: string | null;

  @Column({ default: false })
  isFeatured: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => InfraProjectMilestone, (m) => m.project, { cascade: true })
  milestones: InfraProjectMilestone[];
}
