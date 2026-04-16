import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('interior_projects')
export class InteriorProject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255 })
  location: string;

  @Column({ length: 20, default: '2BHK' })
  propertyType: string;

  @Column({ nullable: true })
  sqft: number;

  @Column({ length: 50, default: 'Premium' })
  package: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costInLakhs: number;

  @Column({ nullable: true })
  deliveryDays: number;

  @Column({ length: 100, nullable: true })
  style: string;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true, default: 4.8 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  rooms: string[];

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ length: 20, default: 'Draft' })
  status: string;

  @Column({ default: false })
  featured: boolean;

  @Column({ nullable: true })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
