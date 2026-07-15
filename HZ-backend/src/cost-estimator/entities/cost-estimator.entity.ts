import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { PropertyType } from 'src/common/enums/cb-property.enum';
import { User } from 'src/user/entities/user.entity';
import { ItemGroup } from './itemgroup.entity';
import { QuotationStatus } from '../Enum/cost-estimator.enum';

@Entity()
export class CostEstimator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'int',
    generated: 'increment',
    nullable: true,
    unique: true,
  })
  quotationNumber: number | null;

  /** Existing rows default to confirmed; new drafts set status explicitly. */
  @Column({
    type: 'varchar',
    length: 20,
    default: QuotationStatus.CONFIRMED,
  })
  status: QuotationStatus;

  @Column('text')
  firstname: string;

  @Column('text')
  lastname: string;
  @Column('text', { default: 'Interior', nullable: true })
  category: string;
 

  @Column('text')
  email: string;

  @Column('bigint', { nullable: true, default: null })
  phone: number;

  @Column({ type: 'varchar', nullable: true })
  customerMobile: string | null;

  @Column('text', { nullable: true, default: null })
  date: string;

  @Column('text', { nullable: true, default: null })
  designerName: string;

  /** Display name of SuperAdmin who approved the quotation */
  @Column('text', { nullable: true, default: null })
  approvedByName: string | null;

  @Column('text', { nullable: true, default: null })
  bhk: string;

  @Column({ type: 'varchar', length: 50, nullable: true, default: PropertyType.Apartment })
  property_type: PropertyType;

  @Column('text', { nullable: true, default: null })
  property_name: string;

  @Column('text', { nullable: true, default: null })
  workType: string | null;

  @Column('text', { nullable: true, default: null })
  currentStage: string | null;

  @Column('text', { nullable: true, default: null })
  floor_plan: string;

  @Column('text', { nullable: true, default: null })
  property_image: string;

  @Column('decimal', { precision: 15, scale: 2 })
  subTotal: number;

  @Column({ type: 'text', nullable: true })
  details: string;

  @OneToMany(() => ItemGroup, (itemGroup) => itemGroup.costEstimator, {
    cascade: true,
    eager: true,
  })
  itemGroups: ItemGroup[];

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'boolean', default: false, nullable: true })
  gstEnabled: boolean;

  @Column('decimal', { precision: 5, scale: 2, default: 18, nullable: true })
  gstPercentage: number;

  @Column('jsonb')
  location: {
    city: string;
    locality: string;
    sub_locality?: string;
    landmark: string;
    state: string;
    pincode: string;
    address_line_1: string;
  };

  @ManyToOne(() => User, (user) => user.costEstimators, { onDelete: 'CASCADE' })
  postedBy: User;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone', nullable: true })
  deletedAt: Date | null;

  @Column({ name: 'restore_token', type: 'varchar', length: 64, nullable: true })
  restoreToken: string | null;

  @Column({ name: 'deleted_by_id', type: 'uuid', nullable: true })
  deletedById: string | null;
}
