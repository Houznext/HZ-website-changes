import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PropertyDetails } from '../propertyDetails.entity';

@Entity('facilities')
export class Facilities {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int',nullable: true })
  minSeats: number;

  @Column({ type: 'int',nullable: true })
  numberOfCabins: number;

  @Column({ type: 'int' ,nullable: true})
  numberOfMeetingRooms: number;

  @Column({ type: 'int' , nullable:true})
  numberOfWashrooms: number;

  @ManyToOne(() => PropertyDetails, (property) => property.facilities)
  property: PropertyDetails;
}
