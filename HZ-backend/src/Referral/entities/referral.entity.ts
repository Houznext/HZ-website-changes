import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
@Entity()
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  friendName: string;

  @Column({ nullable: true })
  friendPhone: string;

  @Column({ nullable: true })
  friendEmail: string;

  @Column({ nullable: true })
  friendCity: string;

  @Column({ type: 'varchar', nullable: true })
  category?: string;

  @Column()
  referralCode: string;

  @ManyToOne(() => User, (user) => user.referrals, { onDelete: 'CASCADE' })
  referrer: User;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
