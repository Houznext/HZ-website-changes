import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BotConversation } from './bot-conversation.entity';

export type BotMessageRole = 'user' | 'assistant';

@Entity('bot_messages')
export class BotMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BotConversation, (c) => c.messages, { onDelete: 'CASCADE' })
  conversation: BotConversation;

  @Column({ type: 'varchar', length: 20 })
  role: BotMessageRole;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
