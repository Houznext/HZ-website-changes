import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CBProperty } from './cb-property.entity';
import { SizeWithUnit } from 'src/company-onboarding/Interfaces/size.interface';
import { CommercialPropertyType } from '../enum/custom-property.enum';

@Entity()
export class CommercialConstruction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: CommercialPropertyType,
    default: CommercialPropertyType.Showroom,
  })
  commercial_type: CommercialPropertyType;

  @Column('jsonb', { nullable: true })
  total_area: SizeWithUnit;

  @Column({ type: 'int', default: 0 })
  total_floors: number;

  @Column({ type: 'int', default: 0, nullable: true })
  basement_floors: number;

  @Column({ type: 'int', default: 0, nullable: true })
  parking_floors: number;

  @Column({ type: 'varchar', default: 'north' })
  land_facing: string;

  @Column({ type: 'varchar', nullable: true })
  gate_side: string;

  @Column('jsonb', { nullable: true })
  length: SizeWithUnit;

  @Column('jsonb', { nullable: true })
  width: SizeWithUnit;

  @Column('jsonb', { nullable: true })
  height: SizeWithUnit;

  @Column({ type: 'int', default: 0 })
  adjacent_roads: number;

  @Column({ type: 'boolean', default: false })
  elevator_required: boolean;

  @Column({ type: 'int', default: 0, nullable: true })
  number_of_elevators: number;

  @Column({ type: 'boolean', default: false })
  central_ac_required: boolean;

  @Column({ type: 'boolean', default: false })
  fire_safety_required: boolean;

  @Column({ type: 'boolean', default: false })
  parking_required: boolean;

  @Column({ type: 'int', default: 0, nullable: true })
  parking_capacity: number;

  @Column({ type: 'boolean', default: false })
  generator_backup_required: boolean;

  @Column({ type: 'int', default: 0, nullable: true })
  generator_capacity_kva: number;

  @Column({ type: 'boolean', default: false })
  water_treatment_required: boolean;

  @Column({ type: 'boolean', default: false })
  sewage_treatment_required: boolean;

  @Column('text', { array: true, nullable: true })
  propertyImages: string[];

  @Column('text', { array: true, nullable: true })
  additionOptions: string[];

  @Column({ type: 'text', nullable: true })
  additional_details: string;

  @Column('jsonb', { nullable: true })
  zoning_info: {
    zone_type?: string;
    fsi_allowed?: number;
    setback_front?: number;
    setback_side?: number;
    setback_rear?: number;
  };

  @OneToOne(() => CBProperty, (property) => property.commercial_construction_info)
  property: CBProperty;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
