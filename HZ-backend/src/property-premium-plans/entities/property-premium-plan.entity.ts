import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PropertyPremiumPlanType {
  FEATURED = 'Featured',
  SPONSORED = 'Sponsored',
  PREMIUM = 'Premium',
  ANALYTICS = 'Analytics',
  TOP = 'Top',
  POPULAR = 'Popular',
}

@Entity('property_premium_plans')
export class PropertyPremiumPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 120 })
  slug: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, default: PropertyPremiumPlanType.FEATURED })
  planType: PropertyPremiumPlanType;

  /** Maps to property.promotionType (e.g. Featured, Sponsored, Premium) */
  @Column({ length: 50 })
  promotionType: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price: string;

  @Column({ type: 'int', default: 30 })
  durationDays: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
