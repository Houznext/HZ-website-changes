import { create } from "zustand";

export type TypingState = { userId: string; isTyping: boolean };

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  type: string;
  text?: string | null;
  attachments?: any[] | null;
  createdAt: string;

  status?: "SENT" | "DELIVERED" | "READ";
  seenBy?: string[];
  replyToMessageId?: string | null;

  clientMessageId?: string | null;
};

export type ChatConversation = {
  id: string;
  type: string;
  title?: string | null;
  image?: string | null;
  updatedAt: string;
  lastMessage?: ChatMessage | null;
  unread?: number;
};

type ChatState = {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  messagesByConv: Record<string, ChatMessage[]>;
  typingByConv: Record<string, TypingState>;

  setConversations: (
    conversations:
      | ChatConversation[]
      | ((prev: ChatConversation[]) => ChatConversation[])
  ) => void;

  setActiveConversationId: (id: string | null) => void;

  setMessages: (
    conversationId: string,
    messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])
  ) => void;

  appendMessage: (conversationId: string, message: ChatMessage) => void;

  bumpConversation: (convId: string, msg: ChatMessage, myId?: string) => void;

  setTyping: (convId: string, userId: string, isTyping: boolean) => void;

  removeMessage: (convId: string, messageId: string) => void;

  upsertMessage: (convId: string, message: ChatMessage) => void;

  clearTyping: (convId: string) => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messagesByConv: {},
  typingByConv: {},

  setConversations: (input) =>
    set((state) => ({
      conversations:
        typeof input === "function" ? input(state.conversations) : input,
    })),

  setActiveConversationId: (id) => set({ activeConversationId: id }),

  setMessages: (conversationId, input) =>
    set((state) => {
      const prev = state.messagesByConv[conversationId] || [];
      const next = typeof input === "function" ? input(prev) : input;

      const sorted = [...next].sort((a, b) => {
        const ta = new Date(a.createdAt).getTime();
        const tb = new Date(b.createdAt).getTime();
        return ta - tb;
      });

      return {
        messagesByConv: { ...state.messagesByConv, [conversationId]: sorted },
      };
    }),

  appendMessage: (conversationId, message) =>
    set((state) => {
      const prev = state.messagesByConv[conversationId] || [];

      if (prev.some((m) => m.id === message.id)) {
        return {};
      }

      if (
        message.clientMessageId &&
        prev.some((m) => m.clientMessageId === message.clientMessageId)
      ) {
        const next = prev.map((m) =>
          m.clientMessageId === message.clientMessageId ? message : m
        );
        return {
          messagesByConv: { ...state.messagesByConv, [conversationId]: next },
        };
      }

      return {
        messagesByConv: {
          ...state.messagesByConv,
          [conversationId]: [...prev, message],
        },
      };
    }),

  bumpConversation: (convId, msg, myId) =>
    set((s) => {
      const isActive = String(s.activeConversationId) === String(convId);

      const updated = s.conversations
        .map((c) => {
          if (String(c.id) !== String(convId)) return c;

          const isMine = typeof myId === "string" && msg.senderId === myId;
          const prevUnread = c.unread ?? 0;

          const nextUnread = isActive
            ? 0
            : isMine
            ? prevUnread
            : prevUnread + 1;

          return {
            ...c,
            lastMessage: msg,
            updatedAt: new Date().toISOString(),
            unread: nextUnread,
          };
        })
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

      return { conversations: updated };
    }),

  setTyping: (convId, userId, isTyping) =>
    set((s) => ({
      typingByConv: { ...s.typingByConv, [convId]: { userId, isTyping } },
    })),

  clearTyping: (convId) =>
    set((s) => {
      const next = { ...s.typingByConv };
      delete next[convId];
      return { typingByConv: next };
    }),

  removeMessage: (convId, messageId) =>
    set((s) => ({
      messagesByConv: {
        ...s.messagesByConv,
        [convId]: (s.messagesByConv[convId] || []).filter(
          (m) => m.id !== messageId
        ),
      },
    })),

  upsertMessage: (convId, message) =>
    set((s) => {
      const prev = s.messagesByConv[convId] || [];

      if (message.clientMessageId) {
        const idxByClient = prev.findIndex(
          (m) => m.clientMessageId === message.clientMessageId
        );
        if (idxByClient !== -1) {
          const next = [...prev];
          next[idxByClient] = message;
          return {
            messagesByConv: { ...s.messagesByConv, [convId]: next },
          };
        }
      }

      const idxById = prev.findIndex((m) => m.id === message.id);
      if (idxById !== -1) {
        const next = [...prev];
        next[idxById] = message;
        return { messagesByConv: { ...s.messagesByConv, [convId]: next } };
      }

      return {
        messagesByConv: { ...s.messagesByConv, [convId]: [...prev, message] },
      };
    }),
}));
