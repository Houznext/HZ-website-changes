import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConstructionStatus } from '../../common/enums/infra.enums';
import { InfraProjectMilestone } from './infra-project-milestone.entity';

@Entity('infra_project')
export class InfraProject {
  @PrimaryGeneratedColumn('uuid')
  projectId: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  slug: string | null;

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
