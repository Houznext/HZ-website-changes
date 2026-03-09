import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import withUserLayout from "@/components/Layouts/UserLayout";
import SEO from "@/components/SEO";
import { useSession } from "next-auth/react";
import apiClient from "@/utils/apiClient";
import { getSocket } from "@/utils/socket";
import { ChatWindow } from "@/components/ChatPanel/ChatWindow";
import type { Attachment, DmUser, Message, MessagesByThread, SendMessageArgs } from "@/utils/chat/types";
import { getTimeHour } from "@/utils/chat/utilFunctions";

const SUPPORT_USER_ID =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPPORT_USER_ID) ||
  "5606a536-e7b8-4f69-af8e-0cb43a1169a2";

const SupportChatPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = session?.user?.id as string | undefined;
  const token = (session as any)?.token as string | undefined;
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [threadId, setThreadId] = useState<string | null>(null);
  const [messagesByThread, setMessagesByThread] = useState<MessagesByThread>({});
  const [threadTheme, setThreadTheme] = useState<string>("classic");
  const [readReceiptsByThread, setReadReceiptsByThread] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");

  const threadKey = useMemo(() => (threadId ? `dm:${threadId}` : null), [threadId]);

  const selectedChat = useMemo<DmUser | null>(() => {
    if (!threadId) return null;
    return {
      id: SUPPORT_USER_ID,
      receiverId: SUPPORT_USER_ID,
      name: "Customer Support",
      status: "offline",
      avatarColor: "bg-[#3586FF]",
      threadId,
    };
  }, [threadId]);

  const messages = useMemo(() => {
    if (!threadKey) return [];
    return messagesByThread[threadKey] ?? [];
  }, [messagesByThread, threadKey]);

  const getAttachmentKind = (mime?: string | null): Attachment["kind"] => {
    if (!mime) return "file";
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("video/")) return "video";
    if (mime.startsWith("audio/")) return "audio";
    return "file";
  };

  useEffect(() => {
    if (status === "authenticated" && userId) {
      socketRef.current = getSocket({ userId, token });
    }
  }, [status, userId, token]);

  useEffect(() => {
    const fetchThread = async () => {
      if (!userId || status !== "authenticated") return;
      setLoading(true);
      setError("");
      try {
        const dmRes = await apiClient.post(
          `${apiClient.URLS.chatDm}?userId=${encodeURIComponent(userId)}`,
          { otherUserId: SUPPORT_USER_ID },
          true
        );
        const nextThreadId = dmRes.body?.threadId as string | undefined;
        if (!nextThreadId) throw new Error("Could not start support chat.");
        setThreadId(nextThreadId);

        const msgRes = await apiClient.get(
          `${apiClient.URLS.chat}/threads/${nextThreadId}/messages?userId=${encodeURIComponent(userId)}&limit=50`,
          {},
          true
        );
        const rawMessages =
          msgRes.body?.messages ?? msgRes.body?.data ?? (Array.isArray(msgRes.body) ? msgRes.body : []);
        setThreadTheme(msgRes.body?.threadTheme ?? "classic");
        const mapped = (rawMessages as any[])
          .map((m) => ({
            id: m.id,
            content: m.content ?? "",
            senderId: m.senderId,
            senderName: m.senderName ?? "Unknown",
            createdAt: m.timestamp,
            timestamp: getTimeHour(m.timestamp),
            isOwn: m.senderId === userId,
            isImportant: m.isImportant,
            attachments: (m.attachments ?? []).map((a: any) => ({
              id: a.id,
              url: a.url,
              name: a.fileName ?? a.name ?? "Attachment",
              mimeType: a.mimeType ?? "",
              size: a.sizeBytes ?? a.size,
              kind: a.kind ?? getAttachmentKind(a.mimeType),
            })),
          }))
          .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const key = `dm:${nextThreadId}`;
        setMessagesByThread((prev) => ({ ...prev, [key]: mapped }));
        if (msgRes.body?.readReceipts) {
          setReadReceiptsByThread((prev) => ({ ...prev, [key]: msgRes.body.readReceipts }));
        }
      } catch (err: any) {
        setError(err?.message ?? "Failed to load chat.");
      } finally {
        setLoading(false);
      }
    };
    fetchThread();
  }, [userId, status]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !threadId || !userId) return;
    socket.emit("thread:join", { kind: "dm", id: threadId });
    socket.emit("thread:read", { threadKind: "dm", threadId });

    const onMessageNew = (payload: any) => {
      if (payload?.threadId !== threadId) return;
      const incoming: Message = {
        id: payload.message.id,
        content: payload.message.content ?? "",
        senderId: payload.message.senderId,
        senderName: payload.message.senderName ?? "Unknown",
        createdAt: payload.message.timestamp,
        timestamp: getTimeHour(payload.message.timestamp),
        isOwn: payload.message.senderId === userId,
        isImportant: payload.message.isImportant,
        attachments: (payload.message.attachments ?? []).map((a: any) => ({
          id: a.id,
          url: a.url,
          name: a.fileName ?? a.name ?? "Attachment",
          mimeType: a.mimeType ?? "",
          size: a.sizeBytes ?? a.size,
          kind: a.kind ?? getAttachmentKind(a.mimeType),
        })),
      };
      setMessagesByThread((prev) => {
        const key = `dm:${threadId}`;
        const list = prev[key] ?? [];
        if (list.some((m) => m.id === incoming.id)) return prev;
        return { ...prev, [key]: [...list, incoming] };
      });
      if (payload.message.senderId !== userId) {
        socket.emit("thread:read", { threadKind: "dm", threadId });
      }
    };

    socket.on("message:new", onMessageNew);
    return () => {
      socket.off("message:new", onMessageNew);
    };
  }, [socketRef.current, threadId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSendMessage = useCallback(
    (args?: SendMessageArgs) => {
      const text = (args?.text ?? newMessage).trim();
      const atts = args?.attachments ?? [];
      const effectiveThreadKey = args?.threadKey ?? threadKey;
      if ((!text && atts.length === 0) || !userId || !threadId || !effectiveThreadKey) return;
      const socket = socketRef.current;
      if (!socket) return;

      const clientId = `cli-${Date.now()}`;
      const timestamp = new Date().toISOString();
      const optimistic: Message = {
        id: clientId,
        content: text,
        senderId: userId,
        senderName: (session?.user as any)?.firstName || "You",
        createdAt: timestamp,
        timestamp: getTimeHour(timestamp),
        isOwn: true,
        isImportant: args?.isImportant,
        attachments: atts.map((a: Attachment) => ({
          id: a.id,
          url: a.url,
          name: a.name,
          mimeType: a.mimeType,
          size: a.size,
          kind: a.kind ?? getAttachmentKind(a.mimeType),
        })),
      };
      setMessagesByThread((prev) => ({
        ...prev,
        [effectiveThreadKey]: [...(prev[effectiveThreadKey] ?? []), optimistic],
      }));

      socket.emit("message:send", {
        threadKind: "dm",
        threadId,
        clientId,
        content: text,
        isImportant: args?.isImportant,
        attachments: atts.map((a: Attachment) => ({
          kind: a.kind ?? getAttachmentKind(a.mimeType),
          url: a.url,
          mimeType: a.mimeType,
          fileName: a.name,
          sizeBytes: a.size,
        })),
        threadKey: effectiveThreadKey,
        dmThreadId: args?.dmThreadId ?? threadId,
      });
    },
    [userId, threadId, threadKey, newMessage, session?.user]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleThemeChange = async (nextTheme: string) => {
    setThreadTheme(nextTheme);
    if (!threadId || !userId) return;
    try {
      await apiClient.patch(
        `${apiClient.URLS.chat}/threads/${threadId}/theme?userId=${encodeURIComponent(userId)}`,
        { theme: nextTheme },
        true
      );
    } catch (err) {
      console.error("Failed to update thread theme", err);
    }
  };

  if (status !== "authenticated") {
    return (
      <div className="w-full p-6">
        <SEO title="Help | OneCasa" />
        <div className="bg-white rounded-lg border p-6 text-center text-gray-600">
          Please log in to chat with support.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-theme(spacing.16))]">
      <SEO title="Help | OneCasa" />
      {error && (
        <div className="px-4 py-2 text-sm text-red-600 bg-red-50 border-b border-red-100">{error}</div>
      )}
      {loading && !threadId && (
        <div className="px-4 py-2 text-sm text-gray-600 bg-gray-50 border-b border-gray-100">
          Loading...
        </div>
      )}
      <ChatWindow
        selectedChat={selectedChat}
        activeTitle="Customer Support"
        closeActive={() => router.back()}
        messagesByThread={messagesByThread}
        messagesEndRef={messagesEndRef}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleKeyDown={handleKeyDown}
        handleSendMessage={handleSendMessage}
        showBackButton
        currentUserId={userId}
        readReceipts={threadKey ? readReceiptsByThread[threadKey] : []}
        threadTheme={threadTheme}
        onThemeChange={handleThemeChange}
      />
    </div>
  );
};

export default withUserLayout(SupportChatPage);
