import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ValueTransformer,
} from 'typeorm';
import { PropertyDetails } from '../propertyDetails.entity';
import { SizeWithUnit } from 'src/company-onboarding/Interfaces/size.interface';

const decimalTransformer: ValueTransformer = {
  to(value: number): string {
    return value ? value.toString() : null; // Convert number to string for database
  },
  from(value: string): number {
    return value ? parseFloat(value) : null; // Convert string to number for application
  },
};

@Entity()
export class PlotAttributes {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PropertyDetails, (property) => property.plotAttributes)
  property: PropertyDetails;

  @Column({ type: 'json', nullable: true })
  plotArea: SizeWithUnit;

  @Column({ type: 'json', nullable: true })
  length: SizeWithUnit; // Length of the plot

  @Column({ type: 'json', nullable: true })
  width: SizeWithUnit; // Width of the plot

  @Column({ type: 'json', nullable: true })
  widthFacingRoad: SizeWithUnit; // Width of the road facing the plot

  @Column({
    type: 'enum',
    enum: [
      'North',
    'South',
    'East',
    'West',
    'NorthEast',
    'NorthWest',
    'SouthEast',
    'SouthWest',
    ],
    nullable: false,
  })
  facing: string;

  @Column({ type: 'enum', enum: ['Immediate', 'Future'], nullable: false })
  possessionStatus: string; // Immediate or Future possession

  @Column({ type: 'date', nullable: true })
  possessionDate: Date; // Mandatory if possessionStatus is "Future"

  @Column({ type: 'enum', enum: ['Resale', 'New Booking'], nullable: false })
  transactionType: string; // Resale or New Booking

  @Column({ type: 'boolean', default: false })
  boundaryWall: boolean; // Whether the plot has a boundary wall

  @Column({ type: 'int', nullable: true })
  noOfFloorsAllowed: number; // Number of floors allowed to construct
}
