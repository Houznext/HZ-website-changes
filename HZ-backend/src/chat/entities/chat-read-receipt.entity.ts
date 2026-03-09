import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { ChatThread } from './chat-thread.entity';
import { User } from '../../user/entities/user.entity';


@Entity('chat_read_receipts')
@Unique(['thread', 'user'])
export class ChatReadReceipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ChatThread, { onDelete: 'CASCADE' })
  thread: ChatThread;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'timestamp', nullable: true })
  lastReadMessageAt: Date | null;
}
