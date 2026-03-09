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
  avatarColor: string; // tailwind bg-* class
}

export interface Channel {
  id: string;
  name: string;
  description:string,
  memberCount: number;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  isPrivate?: boolean;
  isPinned?: boolean;
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

export type ThreadKind = "dm" | "channel";

export type ServerMessageNew = {
  threadKind: ThreadKind;
  threadId: string;
  threadTitle?: string;
  message: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    timestamp: string; // or ISO
    isImportant?: boolean;
    attachments?: Array<{
      id: string;
      kind?: "image" | "video" | "audio" | "file";
      url: string;
      mimeType?: string | null;
      fileName?: string | null;
      sizeBytes?: number | null;
    }>;
  };
};

export type ServerMessageAck = {
  threadKind: ThreadKind;
  threadId: string;
  clientId: string;
  serverId: string;
  timestamp: string;
};

export type ServerThreadUpdate =
  | {
      kind: "dm";
      id: string;
      lastMessage?: string;
      timestamp?: string;
      unreadCount?: number;
    }
  | {
      kind: "channel";
      title?: string;
      description?: string;
      id: string;
      lastMessage?: string;
      timestamp?: string;
      unreadCount?: number;
      memberCount?: number;
    };

export type ThreadApiItem = {
  kind: "dm" | "channel";
  id: string;                 // ✅ threadId UUID
  title?: string | null;      // for channel
  description?: string | null; // for channel
  lastMessage?: string | null;
  timestamp?: string | null;
  unreadCount?: number;
  memberCount?: number;       // for channel
};

export type DmUser = ChatUser & { threadId?: string };


export type ChannelMember = { userId: string; name: string; role: string };
export type ChannelDetails = {
  id: string;
  kind: "channel" | "dm";
  title: string | null;
  isOwner?: boolean;
  members?: ChannelMember[];
};
