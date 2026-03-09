import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { CBProperty } from './cb-property.entity';
import { AreaUnit } from '../enum/custom-property.enum';
import { CBFloor } from 'src/Custombuilder/floor/entities/floor.entity';
import { SizeWithUnit } from 'src/company-onboarding/Interfaces/size.interface';

@Entity()
export class InteriorInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { nullable: true })
  total_area: SizeWithUnit;

  @Column({ type: 'text', nullable: true })
  project_scope: string;

  @Column({ type: 'int', nullable: true })
  totalFloors: number;

  @Column({ type: 'int', default: 0 })
  total_floors: number;

  @Column({ nullable: true })
  style_preference: string;

  @Column({ type: 'jsonb', nullable: true })
  color_scheme: Array<{ label: string; color: string }>;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budget: number;

  @Column({ type: 'text', nullable: true })
  special_requirements: string;

  @Column('text', { array: true, nullable: true })
  reference_images: string[];

  @Column('text', { array: true, nullable: true })
  additionOptions: string[];

  @Column({ type: 'text', nullable: true })
  additional_details: string;

  @OneToMany(() => CBFloor, (floor) => floor.property, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  floors: CBFloor[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => CBProperty, (property) => property.interior_info)
  property: CBProperty;
}
