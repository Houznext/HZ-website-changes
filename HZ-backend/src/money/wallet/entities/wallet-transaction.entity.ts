import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { WalletAccount } from './wallet.entity';
import { WalletReferenceType, WalletTxnType } from '../enum/wallet.enum';

@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WalletAccount, { onDelete: 'CASCADE' })
  wallet: WalletAccount;

  @Column({ type: 'enum', enum: WalletTxnType })
  type: WalletTxnType;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: string;

  @Column({ length: 3, default: 'INR' })
  currency: string;

  @Index()
  @Column({ type: 'enum', enum: WalletReferenceType })
  referenceType: WalletReferenceType;

  @Index()
  @Column()
  referenceId: string;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
