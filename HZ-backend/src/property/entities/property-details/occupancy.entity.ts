import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PropertyDetails } from '../propertyDetails.entity';

@Entity()
export class OccupancyDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PropertyDetails, (property) => property.occupancyDetails)
  property: PropertyDetails;

  @Column({ type: 'enum', enum: ['Male', 'Female', 'Any'], nullable: false })
  lookingFor: string;

  @Column({ type: 'enum', enum: ['Single', 'Shared', 'Any'], nullable: false })
  occupancy: string;

  @Column({ type: 'boolean', default: false })
  privateProfile: boolean;
}