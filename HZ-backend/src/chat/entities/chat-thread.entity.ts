
import { User } from '../../user/entities/user.entity';
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { ChatThreadMember } from './chat-thread-member.entity';

export type ThreadKind = 'dm' | 'channel';

@Entity('chat_threads')
export class ChatThread {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  kind: ThreadKind; // 'dm' | 'channel'

  // for channels (for dm you can keep null)
  @Column({ type: 'varchar', length: 200, nullable: true })
  title: string | null;

  @Column({ type: "text", nullable: true })
description: string | null;

  @Column({ type: "varchar", length: 32, default: "classic" })
  theme: string;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date | null;

  @Column({ type: 'text', nullable: true })
  lastMessagePreview: string | null;

  @CreateDateColumn()
  createdAt: Date;

  // ChatThread
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  createdBy: User;

  @OneToMany(() => ChatThreadMember, (member) => member.thread)
  members: ChatThreadMember[];

  @Column({ default: false })
  archived: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
