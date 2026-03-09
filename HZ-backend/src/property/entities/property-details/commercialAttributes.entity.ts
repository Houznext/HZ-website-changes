import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ValueTransformer } from 'typeorm';
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

export enum OwnershipType {
  FREEHOLD = 'Freehold',
  LEASEHOLD = 'Leasehold',
  JOINT_TENANCY = 'Joint Tenancy',
  COOPERATIVE_SOCIETY = 'Cooperative Society',
  PARTNERSHIP = 'Partnership',
  COOPERATIVE = 'Cooperative',
  POWER_OF_ATTORNEY = 'Power of attorney'
}

export enum LocationHub {
  IT_PARK = 'IT Park',
  BUSINESS_PARK = 'Business Park',
  Commertial = 'Commertial',
  Residential = 'Residential',
  Retail = 'Retail',
  Market = 'Market',
  OTHERS = 'Others',
}

export enum PropertyType {
  OFFICE = 'Office',
  RETAIL_SHOP = 'Retail Shop',
  SHOW_ROOM = 'Show Room',
  PLOT = 'Plot',
}

@Entity('commercial_attribute')
export class CommercialAttribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'simple-array' ,nullable: true})
  suitableFor: string[];

  @Column({ type: 'enum', enum: OwnershipType })
  ownership: OwnershipType;

  @Column({ type: 'enum', enum: LocationHub , nullable:true})
  locationHub: LocationHub;

  @Column({ type: 'json', nullable: true })
  builtUpArea: SizeWithUnit;

  @Column({ type: 'int' , nullable:true})
  totalFloors: number;

  @Column({ type: 'int' , nullable:true})
  currentFloor: number;

  @Column({ type: 'int' , nullable:true})
  twoWheelerParking: number;

  @Column({ type: 'int' , nullable:true})
  fourWheelerParking: number;

  @Column({ type: 'int' , nullable:true})
  staircases: number;

  @Column({ type: 'int' , nullable:true})
  passengerLifts: number;

  @Column({ type: 'json', nullable: true })
  entranceAreaWidth: SizeWithUnit;

  @Column({ type: 'json', nullable: true })
  entranceAreaHeight: SizeWithUnit;

  @ManyToOne(() => PropertyDetails, (property) => property.commercialAttributes)
  property: PropertyDetails;
}
