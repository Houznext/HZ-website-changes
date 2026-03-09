import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  ValueTransformer,
} from 'typeorm';
import { PropertyDetails } from '../propertyDetails.entity';
import { SizeWithUnit } from 'src/company-onboarding/Interfaces/size.interface';
import { BHKType, facingType } from 'src/property/enums/property.enum';

const decimalTransformer: ValueTransformer = {
  to(value: number): string {
    return value ? value.toString() : null; // Convert number to string for database
  },
  from(value: string): number {
    return value ? parseFloat(value) : null; // Convert string to number for application
  },
};

@Entity()
export class ResidentialAttributes {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => PropertyDetails,
    (property) => property.residentialAttributes,
  )
  property: PropertyDetails;

  @Column({ type: 'varchar', nullable: false })
  bhk: BHKType;

  @Column({ type: 'varchar', nullable: false })
  facing: facingType;

  @Column({ type: 'json', nullable: true })
  floorArea: SizeWithUnit;

  @Column({ type: 'json', nullable: true })
  buildupArea: SizeWithUnit;

  @Column({ type: 'int', nullable: true, transformer: decimalTransformer })
  bathrooms: number;

  @Column({ type: 'int', nullable: true, transformer: decimalTransformer })
  balcony: number;

  @Column({ type: 'int', nullable: true, transformer: decimalTransformer })
  totalFloors: number;

  @Column({ type: 'int', nullable: true, transformer: decimalTransformer })
  currentFloor: number;

  @Column({ type: 'boolean', default: false })
  parking2w: boolean;

  @Column({ type: 'boolean', default: false })
  parking4w: boolean;
}
