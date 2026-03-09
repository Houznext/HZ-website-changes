import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ValueTransformer } from 'typeorm';
import { PropertyDetails } from '../propertyDetails.entity';

const decimalTransformer: ValueTransformer = {
  to(value: number): string {
    return value ? value.toString() : null; // Convert number to string for database
  },
  from(value: string): number {
    return value ? parseFloat(value) : null; // Convert string to number for application
  },
};

@Entity()
export class PricingDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PropertyDetails, (property) => property.pricingDetails)
  property: PropertyDetails;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true ,transformer: decimalTransformer})
  monthlyRent: number; // For Rent only

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true , transformer: decimalTransformer})
  advanceAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, transformer: decimalTransformer })
  maintenanceCharges: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, transformer: decimalTransformer })
  securityDeposit: number;

  @Column({ type: 'boolean', default: false })
  isNegotiable: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, transformer: decimalTransformer })
  maxPriceOffer: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true , transformer: decimalTransformer})
  minPriceOffer: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, transformer: decimalTransformer })
  pricePerSqft: number; // For Sell only

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, transformer: decimalTransformer })
  expectedPrice: number; // For Sell only
}