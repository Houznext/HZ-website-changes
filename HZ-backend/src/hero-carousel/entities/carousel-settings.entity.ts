import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('hero_carousel_settings')
export class CarouselSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 3000 })
  intervalMs: number;

  @Column({ default: 'crossfade' })
  transition: string;

  @Column({ default: true })
  showArrows: boolean;

  @Column({ default: true })
  showDots: boolean;

  @Column({ default: true })
  pauseOnHover: boolean;

  @Column({ default: true })
  kenBurns: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
