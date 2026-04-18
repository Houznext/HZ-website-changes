import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('service_content')
export class ServiceContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 60 })
  slug: string;

  @Column({ length: 120 })
  cardTitle: string;

  @Column({ type: 'text', nullable: true })
  cardDescription: string | null;

  @Column({ type: 'text', nullable: true })
  cardImageUrl: string | null;

  @Column({ length: 40, nullable: true })
  cardBadge: string | null;

  @Column({ length: 200 })
  heroHeadline: string;

  @Column({ type: 'text', nullable: true })
  heroSubheading: string | null;

  @Column({ type: 'text', nullable: true })
  heroImageUrl: string | null;

  @Column({ length: 80, nullable: true })
  heroEyebrow: string | null;

  @Column({ length: 80, nullable: true })
  heroCta: string | null;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
