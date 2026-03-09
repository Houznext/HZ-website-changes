import { CBFloor } from 'src/Custombuilder/floor/entities/floor.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  GateDirection,
} from '../enum/custom-property.enum';
import { CBProperty } from './cb-property.entity';
import { SizeWithUnit } from 'src/company-onboarding/Interfaces/size.interface';

@Entity()
export class HouseConstruction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { nullable: true })
  total_area: SizeWithUnit;

  @Column('jsonb', { nullable: true })
  length: SizeWithUnit;

  @Column('jsonb', { nullable: true })
  width: SizeWithUnit;

  @Column({ type: 'int', default: 0 })
  adjacent_roads: number;

  @Column({ type: 'int', default: 0 })
  total_floors: number;

  @Column({
    type: 'varchar',
    default: 'north',
  })
  land_facing: string;

  @Column({
    type: 'varchar',
    default: 'south',
  })
  gate_side: GateDirection;

  @Column({
    type: 'varchar',
    default: 'north',
  })
  staircase_gate: string;

  @Column({ type: 'text', default: null, nullable: true, array: true })
  propertyImages: string[];

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
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => CBProperty, (property) => property.interior_info)
  property: CBProperty;
}
