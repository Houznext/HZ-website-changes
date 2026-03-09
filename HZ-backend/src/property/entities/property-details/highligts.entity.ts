import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PropertyDetails } from '../propertyDetails.entity';

@Entity()
export class Highlights {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PropertyDetails, (property) => property.highlights)
  property: PropertyDetails;

  @Column({ type: 'text', nullable: true })
  highlightText: string; // e.g., "Near Metro Station"
}