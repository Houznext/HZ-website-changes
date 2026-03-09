import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { FlooringPlans } from './units-floor-planing.entity';
import { PropertyType } from './project-property-type.entity';
import { SizeWithUnit } from '../Interfaces/size.interface';

@Entity()
export class Units {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  BHK: string;

  @Column('jsonb', { nullable: true })
  flatSize: SizeWithUnit;

  @Column('jsonb', { nullable: true })
  plotSize: SizeWithUnit;

  @ManyToOne(() => PropertyType, (propertyType) => propertyType.units)
  propertyType: PropertyType;

  @OneToMany(() => FlooringPlans, (flooringPlan) => flooringPlan.unit,{ cascade: true,       // allows saving/updating
  onDelete: 'CASCADE',})
  flooringPlans: FlooringPlans[];
}
