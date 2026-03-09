import { BlogStatus, BlogType } from 'src/Enums/Blogs/blog';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';



@Entity()
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: true, default: null })
  previewDescription: string | null;

  @Column({ nullable: true, default: null })
  thumbnailImageUrl: string | null;

  @Column({ nullable: true, default: null })
  CoverImageUrl: string | null;

  @Column({ nullable: true, default: null })
  externalResourceLink: string | null;

  @Column({
    type: 'enum',
    enum: BlogType,
    default: 'General',
  })
  blogType: BlogType;

  @Column({
    type: 'enum',
    enum: BlogStatus,
    default: 'Regular',
  })
  blogStatus: BlogStatus;

  @Column({ nullable: false })
  content: string;

  @Column({ nullable: true, default: null })
  createdById: number | null;

  @ManyToOne(() => User, (user) => user.createdBlogs, {
    nullable: true,
    onDelete: 'CASCADE', 
  })
  @JoinColumn()
  createdBy: User | null;

  @Column({ nullable: true, default: null })
  updatedById: number | null;

  @ManyToOne((type) => User, { nullable: true, cascade: true })
  @JoinColumn()
  updatedBy: User | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
