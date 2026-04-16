import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('hero_slides')
export class HeroSlide {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  imageUrl: string;

  @Column({ default: true })
  active: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
