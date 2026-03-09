import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BasicDetails } from './basicDetails.entity';
import { LocationDetails } from './location.entity';
import { MediaDetails } from './mediaDetails.entity';
import { PropertyDetails } from './propertyDetails.entity';
import { User } from 'src/user/entities/user.entity';
import { WishlistItems } from 'src/wishlist/entities/wishlistItems.entity';
import { Reviews } from 'src/reviews/entities/reviews.entity';
import { PropertyLead } from '../propertyLead/property-lead.entity';
import { PropertyReferralAgreement } from 'src/referandearn/entities/propertyreferralagreement.entity';
import { ContactRouting } from 'src/referandearn/enum/refer-and-earn.enum';

@Entity()
export class Property {
  @PrimaryGeneratedColumn('uuid')
  propertyId: string;

  @Column({ default: 1 })
  currentStep: number;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  postedDate: Date;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ nullable: true })
  approvedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedDate?: Date;

  @Column({ nullable: true })
  updatedBy?: string;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedDate?: Date;

  @Column({ default: false })
  isPosted: boolean;

  @OneToOne(() => BasicDetails, (basicDetails) => basicDetails.property, {
    cascade: true,
  })
  @JoinColumn()
  basicDetails: BasicDetails;

  /** Active promotion kinds (e.g. Featured, Sponsored, Premium). Set after payment or admin grant. */
  @Column('text', { array: true, nullable: true })
  promotionType: string[];

  /** When the current promotion(s) end. Used to hide boosted badges and revert listing order. */
  @Column({ type: 'timestamp', nullable: true })
  promotionExpiry?: Date;

  /** Labels for display/filtering (e.g. Top, Trending, Hot). Can be set by admin for collabs. */
  @Column({ type: 'simple-array', nullable: true })
  promotionTags: string[];

  @ManyToOne(() => User, (user) => user.properties, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  postedByUser: User;

  @OneToOne(
    () => LocationDetails,
    (locationDetails) => locationDetails.property,
    { cascade: true },
  )
  @JoinColumn()
  locationDetails: LocationDetails;

  @OneToOne(
    () => PropertyDetails,
    (propertyDetails) => propertyDetails.property,
    { cascade: true },
  )
  @JoinColumn()
  propertyDetails: PropertyDetails;

  @OneToOne(() => MediaDetails, (mediaDetails) => mediaDetails.property, {
    cascade: true,
  })
  @JoinColumn()
  mediaDetails: MediaDetails;

  @OneToMany(() => Reviews, (review) => review.property)
  reviews: Reviews[];

  @OneToMany(() => WishlistItems, (wishlist) => wishlist.property)
  wishlistItems: WishlistItems[];

  @OneToMany(() => PropertyLead, (lead) => lead.property, { cascade: true })
  leads: PropertyLead[];

  // refer and earn
  @Column({ default: false })
  isReferAndEarnEnabled: boolean;

  @Column({ nullable: true, type: 'uuid' })
  referAndEarnAgreementId?: string;

  @OneToMany(() => PropertyReferralAgreement, (a) => a.property)
  referralAgreements: PropertyReferralAgreement[];

  @Column({
    type: 'enum',
    enum: ContactRouting,
    default: ContactRouting.OWNER,
  })
  contactRouting: ContactRouting;
  isReadyToPost(): boolean {
    return (
      this.basicDetails !== undefined &&
      this.locationDetails !== undefined &&
      this.propertyDetails !== undefined &&
      this.mediaDetails !== undefined &&
      this.currentStep === 4
    );
  }
}
