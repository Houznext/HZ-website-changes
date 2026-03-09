import { Electronics } from 'src/electronics/entities/electronics.entity';
import { Furniture } from 'src/furnitures/entities/furniture.entity';
import { HomeDecors } from 'src/homeDecors/entities/homeDecors.entity';
import { Property } from 'src/property/entities/property.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ValueTransformer,
} from 'typeorm';

const decimalTransformer: ValueTransformer = {
  to(value: number): string {
    return value != null ? value.toString() : null;
  },
  from(value: string): number {
    return value != null ? parseFloat(value) : null;
  },
};

@Entity('reviews')
export class Reviews {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  rating: number;

  @Column({ type: 'text', nullable: true })
  headline: string;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column('simple-array', { nullable: true })
  media: string[];

  /** For service reviews: e.g. LEGAL_PACKAGE, INTERIOR_PACKAGE, SOLAR_PACKAGE, CUSTOM_BUILDER_PACKAGE */
  @Column({ nullable: true })
  targetType: string;

  @Column({ nullable: true })
  targetId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Property, (property) => property.reviews, { nullable: true })
  property: Property;

  @ManyToOne(() => HomeDecors, (homeDecor) => homeDecor.reviews, {
    nullable: true,
  })
  homeDecor: HomeDecors;

  @ManyToOne(() => Furniture, (furniture) => furniture.reviews, {
    nullable: true,
  })
  furniture: Furniture;

  @ManyToOne(() => Electronics, (electronics) => electronics.reviews, {
    nullable: true,
  })
  electronics: Electronics;

  @ManyToOne(() => User, (user) => user.reviews, { nullable: false })
  user: User;
}
