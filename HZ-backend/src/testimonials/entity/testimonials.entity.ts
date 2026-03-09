import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
   CreateDateColumn,UpdateDateColumn
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { TestimonialCategory } from 'src/Enums/testimonial-category';
@Entity('testimonials')
export class Testimonials {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  userimage?: string;

  @Column()
  rating: number;

  @Column()
  content: string;

  @Column()
  location: string;

  @ManyToOne(() => User, (user) => user.testimonials)
  user: User;

  @Column({
    type: 'enum',
    enum: TestimonialCategory,
  })
  category: TestimonialCategory;
   @Column('simple-array', { nullable: true })
  testimonialImages: string[];

 
  @Column('simple-array', { nullable: true })
  testimonialVideos: string[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  updatedAt: Date;
}
