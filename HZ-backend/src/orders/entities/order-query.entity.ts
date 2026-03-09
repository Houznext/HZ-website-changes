import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity';
import { User } from 'src/user/entities/user.entity';

export type OrderQueryReply = {
  byUserId: string;
  message: string;
  at: string; // ISO date
};

export enum OrderQueryStatus {
  OPEN = 'OPEN',
  ANSWERED = 'ANSWERED',
  CLOSED = 'CLOSED',
}

@Entity('order_queries')
export class OrderQuery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @Index()
  order: Order;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ length: 255 })
  subject: string;

  @Column('text')
  message: string;

  @Column({ type: 'enum', enum: OrderQueryStatus, default: OrderQueryStatus.OPEN })
  @Index()
  status: OrderQueryStatus;

  /** Admin/staff replies – when they update the query */
  @Column({ type: 'jsonb', nullable: true })
  adminReplies?: OrderQueryReply[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
