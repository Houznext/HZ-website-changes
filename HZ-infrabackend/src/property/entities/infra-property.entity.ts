import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConstructionStatus, ListingFor, PropertyType } from '../../common/enums/infra.enums';
import { InfraPropertyMedia } from './infra-property-media.entity';
import { InfraPropertyDetails } from './infra-property-details.entity';

@Entity('infra_property')
export class InfraProperty {
  @PrimaryGeneratedColumn('uuid')
  propertyId: string;

  /** Explicit type required: `string | null` reflects as Object for metadata inference. */
  @Column({ type: 'varchar', length: 24, unique: true, nullable: true })
  propertyCode: string | null;

  @Column({ type: 'int', default: 0 })
  propertySeq: number;

  @Column()
  title: string;

  @Column({ type: 'varchar', nullable: true })
  slug: string | null;

  @Column({ type: 'enum', enum: PropertyType })
  propertyType: PropertyType;

  @Column({ type: 'enum', enum: ListingFor, default: ListingFor.Buy })
  listingFor: ListingFor;

  @Column({ type: 'enum', enum: ConstructionStatus })
  constructionStatus: ConstructionStatus;

  @Column({ type: 'varchar', nullable: true })
  city: string | null;

  @Column({ type: 'varchar', nullable: true })
  locality: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', nullable: true })
  pincode: string | null;

  @Column('decimal', { nullable: true, precision: 10, scale: 7 })
  latitude: string | null;

  @Column('decimal', { nullable: true, precision: 10, scale: 7 })
  longitude: string | null;

  @Column({ type: 'varchar', nullable: true })
  bhkType: string | null;

  @Column('decimal', { nullable: true, precision: 14, scale: 2 })
  carpetArea: string | null;

  @Column('decimal', { nullable: true, precision: 14, scale: 2 })
  builtUpArea: string | null;

  @Column('decimal', { nullable: true, precision: 14, scale: 2 })
  superBuiltUpArea: string | null;

  @Column('decimal', { nullable: true, precision: 14, scale: 2 })
  plotArea: string | null;

  @Column('decimal', { nullable: true, precision: 14, scale: 2 })
  landArea: string | null;

  @Column({ type: 'varchar', nullable: true })
  areaUnit: string | null;

  @Column({ name: 'floor', type: 'int', nullable: true })
  floorNumber: number | null;

  @Column({ type: 'int', nullable: true })
  totalFloors: number | null;

  @Column({ type: 'varchar', nullable: true })
  towerName: string | null;

  @Column({ type: 'varchar', nullable: true })
  facing: string | null;

  @Column({ type: 'varchar', nullable: true })
  parkingType: string | null;

  @Column({ type: 'varchar', nullable: true })
  furnishingStatus: string | null;

  @Column({ type: 'varchar', nullable: true })
  possessionDate: string | null;

  @Column({ type: 'varchar', nullable: true })
  landUseType: string | null;

  @Column({ type: 'varchar', nullable: true })
  approvalAuthority: string | null;

  @Column({ type: 'varchar', nullable: true })
  approvalType: string | null;

  @Column({ type: 'varchar', nullable: true })
  approvalNumber: string | null;

  @Column({ type: 'varchar', nullable: true })
  surveyNumber: string | null;

  @Column({ type: 'varchar', nullable: true })
  layoutName: string | null;

  @Column({ type: 'varchar', nullable: true })
  roadWidth: string | null;

  @Column({ type: 'varchar', nullable: true })
  zoneType: string | null;

  @Column({ type: 'varchar', nullable: true })
  waterSource: string | null;

  @Column({ type: 'varchar', nullable: true })
  electricity: string | null;

  @Column({ type: 'varchar', nullable: true })
  plotNumber: string | null;

  @Column({ default: false })
  isCornerPlot: boolean;

  @Column({ default: false })
  isGatedLayout: boolean;

  @Column({ default: false })
  hasCompoundWall: boolean;

  @Column({ default: false })
  isReadyToRegister: boolean;

  @Column({ default: false })
  hasEBConnection: boolean;

  @Column({ default: false })
  hasBorewell: boolean;

  @Column({ default: false })
  hasDrainage: boolean;

  @Column({ default: false })
  isPattaAvailable: boolean;

  @Column({ name: 'isTitleVerified', default: false })
  isTitleClear: boolean;

  @Column({ default: false })
  isGatedCommunity: boolean;

  @Column({ default: false })
  isVastuCompliant: boolean;

  @Column({ default: false })
  hasPrivatePool: boolean;

  @Column({ default: false })
  hasGarden: boolean;

  @Column({ default: false })
  hasSmartHome: boolean;

  @Column({ default: false })
  hasEVCharging: boolean;

  @Column({ type: 'varchar', nullable: true })
  numberOfFloors: string | null;

  @Column('decimal', { nullable: true, precision: 18, scale: 2 })
  basePrice: string | null;

  @Column('decimal', { nullable: true, precision: 18, scale: 2 })
  pricePerUnit: string | null;

  @Column('decimal', { nullable: true, precision: 6, scale: 2 })
  gstPercent: string | null;

  @Column('decimal', { nullable: true, precision: 6, scale: 2 })
  registrationPercent: string | null;

  @Column('decimal', { nullable: true, precision: 18, scale: 2 })
  maintenanceDeposit: string | null;

  @Column('decimal', { nullable: true, precision: 18, scale: 2 })
  otherCharges: string | null;

  @Column('decimal', { nullable: true, precision: 18, scale: 2 })
  totalCost: string | null;

  @Column({ type: 'varchar', nullable: true })
  reraNumber: string | null;

  @Column({ type: 'varchar', nullable: true })
  reraExpiry: string | null;

  @Column({ type: 'varchar', nullable: true })
  promoterName: string | null;

  @Column({ default: false })
  isReraVerified: boolean;

  @Column({ default: false })
  isEcVerified: boolean;

  @Column({ default: false })
  isHouznextVerified: boolean;

  @Column('text', { array: true, nullable: true })
  photoUrls: string[] | null;

  @Column({ type: 'varchar', nullable: true })
  coverImageUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  reraCertUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  ecCertUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  floorPlanUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  brochureUrl: string | null;

  /** Paste-style YouTube URL for an optional property tour embed on the public site. */
  @Column({ type: 'varchar', length: 512, nullable: true })
  youtubeVideoUrl: string | null;

  @Column('text', { array: true, nullable: true })
  amenities: string[] | null;

  @Column('text', { array: true, nullable: true })
  highlights: string[] | null;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ type: 'varchar', nullable: true })
  approvedBy: string | null;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: false })
  isZeroBrokerage: boolean;

  @Column({ default: true })
  enableWhatsappEnquiry: boolean;

  @Column({ type: 'varchar', nullable: true })
  ownerName: string | null;

  @Column({ type: 'varchar', nullable: true })
  ownerPhone: string | null;

  @Column({ type: 'varchar', nullable: true })
  ownerEmail: string | null;

  @Column({ type: 'varchar', nullable: true })
  ownerAlternatePhone: string | null;

  @Column({ type: 'varchar', length: 64, default: 'houznext' })
  listedBy: string;

  @Column({ type: 'varchar', nullable: true })
  listedByUserId: string | null;

  @Column({ type: 'varchar', nullable: true })
  leadSource: string | null;

  @Column({ type: 'varchar', nullable: true })
  branch: string | null;

  @Column({ type: 'text', nullable: true })
  internalNotes: string | null;

  @Column({ type: 'varchar', nullable: true })
  linkedProjectId: string | null;

  @Column('text', { nullable: true })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => InfraPropertyMedia, (m) => m.property, { cascade: true })
  media: InfraPropertyMedia[];

  @OneToOne(() => InfraPropertyDetails, (d) => d.property, { cascade: true })
  details: InfraPropertyDetails;
}
