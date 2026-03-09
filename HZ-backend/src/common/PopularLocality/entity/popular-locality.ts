import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class PopularLocality {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  zone?: string;

  @Column({ default: true })
  isActive: boolean;
}
