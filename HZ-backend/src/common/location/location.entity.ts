import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from 'src/company-onboarding/entities/company-projects.entity';
import { User } from 'src/user/entities/user.entity';
import { Company } from 'src/company-onboarding/entities/company.entity';

@Entity('location_details')
export class LocationDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  locality: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subLocality: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  area: string;

  @Column({ type: 'varchar', length: 6, nullable: true })
  zipCode: string;

  @Column({ type: 'varchar', length: 400, nullable: true })
  formattedAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  street: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  landmark: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  latitude: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  longitude: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  place_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  zone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  label: string;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address_line_1: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address_line_2: string;

  @OneToOne(() => Project, (project) => project.location, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  project: Project;

  @ManyToOne(() => Company, (company) => company.locatedIn)
  company: Company;

  @ManyToOne(() => User, (user) => user.locations, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
