import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ConstructionStatus } from './property-details/constructionStatus.entity';
import { Furnishing } from './property-details/furnishing.entity';
import { Highlights } from './property-details/highligts.entity';
import { OccupancyDetails } from './property-details/occupancy.entity';
import { PlotAttributes } from './property-details/plot.entity';
import { PricingDetails } from './property-details/pricingDetails.entity';
import { ResidentialAttributes } from './property-details/residential.entity';
import { Property } from './property.entity';
import { BasicDetails } from './basicDetails.entity';
import { CommercialAttribute } from './property-details/commercialAttributes.entity';
import { Facilities } from './property-details/facilities.entity';
import { FlatshareAttributes } from './property-details/flatshareDetails.entity';

@Entity()
export class PropertyDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: [
      'Apartment',
      'Independent Floor',
      'Villa',
      'Independent House',
      'Plot',
      'Agriculture Land',
      'Office',
      'Retail Shop',
      'Show Room',
    ],
    nullable: false,
  })
  propertyType: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  propertyName: string;

  @OneToOne(() => ResidentialAttributes, (resAttr) => resAttr.property)
  residentialAttributes: ResidentialAttributes;

  @OneToOne(() => PlotAttributes, (plotAttributes) => plotAttributes.property, {
    cascade: true,
  })
  plotAttributes: PlotAttributes;

  @OneToOne(
    () => CommercialAttribute,
    (commAttribute) => commAttribute.property,
  )
  commercialAttributes: CommercialAttribute;

  @OneToOne(() => ConstructionStatus, (conStatus) => conStatus.property)
  constructionStatus: ConstructionStatus;

  @OneToOne(() => Facilities, (facilities) => facilities.property, {
    nullable: true,
    cascade: false,
  })
  facilities: Facilities;

  @OneToOne(() => Furnishing, (furnish) => furnish.property)
  furnishing: Furnishing;

  @OneToOne(() => PricingDetails, (pricing) => pricing.property)
  pricingDetails: PricingDetails;

  // @OneToOne(
  //   () => FlatshareAttributes,
  //   (flatshare) => flatshare.propertyDetails,
  //   {
  //     cascade: true,
  //     nullable: true,
  //     eager: true,
  //   },
  // )
  // @JoinColumn()
  // flatshareAttributes: FlatshareAttributes;
  // property-details.entity.ts
  @OneToOne(
    () => FlatshareAttributes,
    (flatshare) => flatshare.propertyDetails,
    {
      cascade: true,
      nullable: true,
      eager: true,
    },
  )
  @JoinColumn({ name: 'flatshare_id' })
  flatshareAttributes: FlatshareAttributes;

  @OneToOne(() => OccupancyDetails, (occupancy) => occupancy.property, {
    nullable: true,
  })
  occupancyDetails: OccupancyDetails; // Optional, for Flat Share only

  @OneToMany(() => Highlights, (highlight) => highlight.property, {
    nullable: true,
  })
  highlights: Highlights[]; // Optional, for Flat Share

  @OneToOne(() => Property, (property) => property.propertyDetails)
  property: Property;

  @OneToOne(() => BasicDetails, (basicDetails) => basicDetails.propertyDetails)
  @JoinColumn()
  basicDetails: BasicDetails;
}
