import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Property } from './property.entity';
import { PropertyDetails } from './propertyDetails.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class BasicDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['Owner', 'Builder', 'Agent'] })
  ownerType: string;

  @Column({ type: 'enum', enum: ['Residential', 'Commercial'] })
  purpose: string;

  @Column({
    type: 'enum',
    enum: ['Rent', 'Sell', 'Flat Share'],
    nullable: false,
  })
  lookingType: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ type: 'bigint', nullable: true })
  phone: number;

  @OneToOne(() => Property, (property) => property.basicDetails)
  property: Property;
  @ManyToOne(() => User, (user) => user.properties, { nullable: false })
  @JoinColumn({ name: 'postedByUserId' })
  postedByUser: User;

  @Column({ nullable: true })
  postedByUserId: number;

  @OneToOne(
    () => PropertyDetails,
    (propertyDetails) => propertyDetails.basicDetails,
  )
  propertyDetails: PropertyDetails;
}
