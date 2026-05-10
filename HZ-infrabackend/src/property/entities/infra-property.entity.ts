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

  @Column()
  title: string;

  @Column({ type: 'varchar', nullable: true })
  slug: string | null;

  @Column({ type: 'enum', enum: PropertyType })
  propertyType: PropertyType;

  @Column({ type: 'enum', enum: ListingFor })
  listingFor: ListingFor;

  @Column({ type: 'enum', enum: ConstructionStatus })
  constructionStatus: ConstructionStatus;

  @Column({ type: 'varchar', nullable: true })
  bhkType: string | null;

  @Column('decimal', { nullable: true, precision: 14, scale: 2 })
  carpetArea: string | null;

  @Column({ type: 'varchar', nullable: true })
  areaUnit: string | null;

  @Column('decimal', { nullable: true, precision: 18, scale: 2 })
  basePrice: string | null;

  @Column('decimal', { nullable: true, precision: 18, scale: 2 })
  pricePerUnit: string | null;

  @Column({ type: 'varchar', nullable: true })
  city: string | null;

  @Column({ type: 'varchar', nullable: true })
  locality: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column('decimal', { nullable: true, precision: 10, scale: 7 })
  latitude: string | null;

  @Column('decimal', { nullable: true, precision: 10, scale: 7 })
  longitude: string | null;

  @Column({ type: 'varchar', nullable: true })
  reraNumber: string | null;

  @Column({ default: false })
  isReraVerified: boolean;

  @Column({ default: false })
  isTitleVerified: boolean;

  @Column({ default: false })
  isEcVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  facing: string | null;

  @Column({ type: 'int', nullable: true })
  floor: number | null;

  @Column({ type: 'int', nullable: true })
  totalFloors: number | null;

  @Column({ type: 'varchar', nullable: true })
  furnishingStatus: string | null;

  @Column('text', { nullable: true })
  description: string | null;

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

  @Column({ default: 'houznext' })
  listedBy: string;

  @Column({ type: 'varchar', nullable: true })
  listedByUserId: string | null;

  @Column({ type: 'varchar', nullable: true })
  possessionDate: string | null;

  @Column({ default: false })
  isFeatured: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => InfraPropertyMedia, (m) => m.property, { cascade: true })
  media: InfraPropertyMedia[];

  @OneToOne(() => InfraPropertyDetails, (d) => d.property, { cascade: true })
  details: InfraPropertyDetails;
}
