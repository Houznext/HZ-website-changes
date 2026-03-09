import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { RewardReferenceType, RewardTxnType } from './enum/rewards.enum';
import { RewardAccount } from './rewards.entity';

@Entity('reward_transactions')
export class RewardTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RewardAccount, { onDelete: 'CASCADE' })
  account: RewardAccount;

  @Column({ type: 'enum', enum: RewardTxnType })
  type: RewardTxnType;

  @Column({ type: 'int' })
  points: number;

  @Index()
  @Column({ type: 'enum', enum: RewardReferenceType })
  referenceType: RewardReferenceType;

  @Index()
  @Column()
  referenceId: string;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
