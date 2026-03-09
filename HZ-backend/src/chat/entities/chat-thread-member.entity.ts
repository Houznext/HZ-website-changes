import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ChatThread } from "./chat-thread.entity";
import { User } from '../../user/entities/user.entity';

export enum ThreadRole {
  OWNER = "OWNER",
  MEMBER = "MEMBER",
  ADMIN = "ADMIN"
}

@Entity("chat_thread_members")
@Unique(["thread", "user"])
export class ChatThreadMember {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => ChatThread, { onDelete: "CASCADE" })
  thread: ChatThread;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user: User;

  @Column({ type: "enum", enum: ThreadRole, default: ThreadRole.MEMBER })
  role: ThreadRole;

  @Column({ type: "int", default: 0 })
  unreadCount: number;
}
