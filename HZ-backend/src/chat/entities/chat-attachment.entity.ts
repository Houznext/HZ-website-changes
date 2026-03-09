
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn } from "typeorm";
import { ChatMessage } from "./chat-message.entity";
import { ChatThread } from "./chat-thread.entity";

export enum AttachmentKind {
  IMAGE = 'image',
  FILE = 'file',
  VIDEO = 'video',
  AUDIO = 'audio',
}

@Entity('chat_attachments')
export class ChatAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ChatMessage, m => m.attachments, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'message_id' })
  message: ChatMessage ; // allow orphan attachments (sent without text)

  @Column({ type: 'enum', enum: AttachmentKind })
  kind: AttachmentKind;

  @Column()
  url: string;

  @Column({ nullable: true })
  mimeType?: string;

  @Column({ nullable: true })
  fileName?: string;

  @Column({ type: 'bigint', nullable: true })
  sizeBytes?: number;

  @Column({ type: 'int', nullable: true })
  width?: number;

  @Column({ type: 'int', nullable: true })
  height?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
