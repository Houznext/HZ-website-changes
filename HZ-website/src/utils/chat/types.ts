export type PresenceStatus = "online" | "away" | "offline";

export interface ChatUser {
  id: string;
  name: string;
  receiverId?: string;
  status: PresenceStatus;
  lastSeen?: string;
  unreadCount?: number;
  lastMessage?: string;
  timestamp?: string;
  isPinned?: boolean;
  isMuted?: boolean;
  avatarColor: string;
}

export interface Attachment {
  id: string;
  kind?: "image" | "video" | "audio" | "file";
  url: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface SendMessageArgs {
  text?: string;
  attachments?: Attachment[];
  threadKey?: string;
  channelId?: string;
  dmThreadId?: string;
  isImportant?: boolean;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isOwn: boolean;
  createdAt?: string;
  attachments?: Attachment[];
  isImportant?: boolean;
}

export type MessagesByThread = Record<string, Message[]>;

export type DmUser = ChatUser & { threadId?: string };
