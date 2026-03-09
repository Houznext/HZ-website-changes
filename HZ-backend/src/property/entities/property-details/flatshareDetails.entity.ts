import { SizeWithUnit } from 'src/company-onboarding/Interfaces/size.interface';
import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Property } from '../property.entity';
import { PropertyDetails } from '../propertyDetails.entity';
import {
  BHKType,
  facingType,
  WaterAvailability,
} from 'src/property/enums/property.enum';

@Entity()
export class FlatshareAttributes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  lookingFor: string;

  @Column({ nullable: true })
  occupancy: string;

  @Column({ type: 'varchar', nullable: true })
  bhk: BHKType;

  @Column({ type: 'varchar', nullable: true })
  facing: facingType;

  @Column({ type: 'varchar', nullable: true })
  waterAvailability: WaterAvailability;

  @Column({ type: 'int', nullable: true })
  bathroom: number | null;

  @Column({ type: 'int', nullable: true })
  balcony: number | null;

@Column({ type: 'jsonb', nullable: true })
floorArea: SizeWithUnit | null;


  @Column({ type: 'int', nullable: true })
  totalFloors: number | null;

  @Column({ type: 'int', nullable: true })
  currentFloor: number | null;

  @Column({ default: false })
  parking2w: boolean;

  @Column({ default: false })
  parking4w: boolean;

  // @OneToOne(
  //   () => PropertyDetails,
  //   (propertyDetails) => propertyDetails.flatshareAttributes,
  // )
  // @JoinColumn()
  // propertyDetails: PropertyDetails;
  @OneToOne(() => PropertyDetails, (pd) => pd.flatshareAttributes)
propertyDetails: PropertyDetails;
}
