import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PropertyDetails } from '../propertyDetails.entity';

@Entity()
export class Furnishing {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PropertyDetails, (property) => property.furnishing)
  property: PropertyDetails;

  @Column({ type: 'enum', enum: ['Fully Furnished', 'Semi Furnished', 'Unfurnished'], nullable: true })
  furnishedType: string;

  @Column({ type: 'simple-array', nullable: true })
  amenities: string[]; // List of amenities like AC, Power Backup, etc.

  @Column({type : 'simple-array', nullable: true })
  furnishings: string[];

}