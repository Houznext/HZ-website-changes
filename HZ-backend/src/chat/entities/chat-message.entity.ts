import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ChatThread } from './chat-thread.entity';
import { User } from '../../user/entities/user.entity';
import { ChatAttachment } from './chat-attachment.entity';

@Index(['thread', 'createdAt'])
@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ChatThread, { onDelete: 'CASCADE' })
  thread: ChatThread;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  sender: User;

  @Column({ type: 'text', nullable: true })
  content: string; // allow null for "attachment-only" messages

  @OneToMany(() => ChatAttachment, a => a.message, { nullable: true })
  attachments: ChatAttachment[];

  @Column({ default: false })
  isImportant: boolean;


  @CreateDateColumn()
  createdAt: Date;
}
