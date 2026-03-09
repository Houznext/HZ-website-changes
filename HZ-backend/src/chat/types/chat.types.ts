export type ThreadKind = 'dm' | 'channel';

export interface ThreadListItem {
  kind: ThreadKind;
  id: string;
  title: string | null;
  theme?: string;
  lastMessage: string | null;
  timestamp: string | null;
  unreadCount: number;
  memberCount: number;
}

