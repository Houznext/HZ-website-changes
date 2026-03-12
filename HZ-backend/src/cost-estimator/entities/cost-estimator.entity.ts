import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn
} from 'typeorm';
import { PropertyType } from '../../Custombuilder/custom-property/enum/custom-property.enum';
import { User } from 'src/user/entities/user.entity';
import { ItemGroup } from './itemgroup.entity';

@Entity()
export class CostEstimator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column('text', { nullable: true, default: null })
  date: string;

  @Column('text', { nullable: true, default: null })
  designerName: string;

  @Column('text', { nullable: true, default: null })
  bhk: string;

  @Column({
    type: 'enum',
    enum: PropertyType,
    default: PropertyType.Apartment,
    nullable: true,
  })
  property_type: PropertyType;

  @Column('text', { nullable: true, default: null })
  property_name: string;

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
}
