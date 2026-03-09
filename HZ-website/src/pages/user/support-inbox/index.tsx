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

type ThreadListItem = {
  id: string;
  kind: string;
  title: string;
  receiverId?: string | null;
  lastMessage?: string | null;
  timestamp?: string | null;
  unreadCount?: number;
};

const SupportInboxPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = session?.user?.id as string | undefined;
  const token = (session as any)?.token as string | undefined;
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [threads, setThreads] = useState<ThreadListItem[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [selectedThreadTitle, setSelectedThreadTitle] = useState<string>("");
  const [messagesByThread, setMessagesByThread] = useState<MessagesByThread>({});
  const [threadTheme, setThreadTheme] = useState<string>("classic");
  const [readReceiptsByThread, setReadReceiptsByThread] = useState<Record<string, any[]>>({});
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");

  const threadKey = useMemo(() => (selectedThreadId ? `dm:${selectedThreadId}` : null), [selectedThreadId]);

  const selectedChat = useMemo<DmUser | null>(() => {
    if (!selectedThreadId || !selectedThreadTitle) return null;
    return {
      id: selectedThreadId,
      receiverId: threads.find((t) => t.id === selectedThreadId)?.receiverId ?? undefined,
      name: selectedThreadTitle,
      status: "offline",
      avatarColor: "bg-[#3586FF]",
      threadId: selectedThreadId,
    };
  }, [selectedThreadId, selectedThreadTitle, threads]);

  const getAttachmentKind = (mime?: string | null): Attachment["kind"] => {
    if (!mime) return "file";
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("video/")) return "video";
    if (mime.startsWith("audio/")) return "audio";
    return "file";
  };

  const isSupportUser = userId === SUPPORT_USER_ID;

  useEffect(() => {
    if (status === "authenticated" && userId) {
      socketRef.current = getSocket({ userId, token });
    }
  }, [status, userId, token]);

  useEffect(() => {
    const fetchThreads = async () => {
      if (!userId || status !== "authenticated" || !isSupportUser) return;
      setLoadingThreads(true);
      setError("");
      try {
        const res = await apiClient.get(
          `${apiClient.URLS.chatThreads}?userId=${encodeURIComponent(userId)}`,
          {},
          true
        );
        const list = Array.isArray(res.body) ? res.body : res.body?.data ?? [];
        setThreads(
          list.map((t: any) => ({
            id: t.id,
            kind: t.kind ?? "dm",
            title: t.title ?? t.receiverId ?? "Customer",
            receiverId: t.receiverId ?? null,
            lastMessage: t.lastMessage ?? null,
            timestamp: t.timestamp ?? null,
            unreadCount: t.unreadCount ?? 0,
          }))
        );
      } catch (err: any) {
        setError(err?.message ?? "Failed to load threads.");
      } finally {
        setLoadingThreads(false);
      }
    };
    fetchThreads();
  }, [userId, status, isSupportUser]);

  useEffect(() => {
    if (!selectedThreadId || !userId || !isSupportUser) return;
    const key = `dm:${selectedThreadId}`;
    const title = threads.find((t) => t.id === selectedThreadId)?.title ?? "Customer";
    setSelectedThreadTitle(title);
    if (messagesByThread[key]?.length) return;
    setLoadingMessages(true);
    apiClient
      .get(
        `${apiClient.URLS.chat}/threads/${selectedThreadId}/messages?userId=${encodeURIComponent(userId)}&limit=50`,
        {},
        true
      )
      .then((msgRes) => {
        const rawMessages =
          msgRes.body?.messages ?? msgRes.body?.data ?? (Array.isArray(msgRes.body) ? msgRes.body : []);
        setThreadTheme(msgRes.body?.threadTheme ?? "classic");
        const mapped = (rawMessages as any[])
          .map((m: any) => ({
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
        setMessagesByThread((prev) => ({ ...prev, [key]: mapped }));
        if (msgRes.body?.readReceipts) {
          setReadReceiptsByThread((prev) => ({ ...prev, [key]: msgRes.body.readReceipts }));
        }
      })
      .catch((err) => setError(err?.message ?? "Failed to load messages."))
      .finally(() => setLoadingMessages(false));
  }, [selectedThreadId, userId, isSupportUser, threads]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !selectedThreadId || !userId) return;
    socket.emit("thread:join", { kind: "dm", id: selectedThreadId });
    socket.emit("thread:read", { threadKind: "dm", threadId: selectedThreadId });

    const onMessageNew = (payload: any) => {
      if (payload?.threadId !== selectedThreadId) return;
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
        const key = `dm:${selectedThreadId}`;
        const list = prev[key] ?? [];
        if (list.some((m) => m.id === incoming.id)) return prev;
        return { ...prev, [key]: [...list, incoming] };
      });
      if (payload.message.senderId !== userId) {
        socket.emit("thread:read", { threadKind: "dm", threadId: selectedThreadId });
      }
    };

    socket.on("message:new", onMessageNew);
    return () => {
      socket.off("message:new", onMessageNew);
    };
  }, [selectedThreadId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesByThread[threadKey ?? ""]?.length ?? 0]);

  const handleSendMessage = useCallback(
    (args?: SendMessageArgs) => {
      const text = (args?.text ?? newMessage).trim();
      const atts = args?.attachments ?? [];
      const effectiveThreadKey = args?.threadKey ?? threadKey;
      if ((!text && atts.length === 0) || !userId || !selectedThreadId || !effectiveThreadKey) return;
      const socket = socketRef.current;
      if (!socket) return;

      const clientId = `cli-${Date.now()}`;
      const timestamp = new Date().toISOString();
      const optimistic: Message = {
        id: clientId,
        content: text,
        senderId: userId,
        senderName: (session?.user as any)?.firstName || "Support",
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
        threadId: selectedThreadId,
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
        dmThreadId: args?.dmThreadId ?? selectedThreadId,
      });
    },
    [userId, selectedThreadId, threadKey, newMessage, session?.user]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleThemeChange = async (nextTheme: string) => {
    setThreadTheme(nextTheme);
    if (!selectedThreadId || !userId) return;
    try {
      await apiClient.patch(
        `${apiClient.URLS.chat}/threads/${selectedThreadId}/theme?userId=${encodeURIComponent(userId)}`,
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
        <SEO title="Support Inbox | OneCasa" />
        <div className="bg-white rounded-lg border p-6 text-center text-gray-600">
          Please log in to access the support inbox.
        </div>
      </div>
    );
  }

  if (!isSupportUser) {
    return (
      <div className="w-full p-6">
        <SEO title="Support Inbox | OneCasa" />
        <div className=" rounded-lg border border-amber-200 p-6 text-center text-amber-800 bg-amber-50">
          Access restricted. Only support staff can view this page.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-theme(spacing.16))] flex flex-col md:flex-row">
      <SEO title="Support Inbox | OneCasa" />
      {error && (
        <div className="px-4 py-2 text-sm text-red-600 bg-red-50 border-b border-red-100 flex-shrink-0">{error}</div>
      )}
      <aside className="w-full md:w-80 border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Customer chats</h2>
          <p className="text-xs text-gray-500 mt-0.5">Click a thread to reply</p>
        </div>
        {loadingThreads ? (
          <div className="p-4 text-sm text-gray-500">Loading threads…</div>
        ) : threads.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No conversations yet.</div>
        ) : (
          <ul className="overflow-y-auto flex-1">
            {threads.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setSelectedThreadId(t.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedThreadId === t.id ? "bg-[#3586FF]/10 border-l-2 border-l-[#3586FF]" : ""
                    }`}
                >
                  <p className="font-medium text-gray-900 truncate">{t.title || "Customer"}</p>
                  {t.lastMessage && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">{t.lastMessage}</p>
                  )}
                  {t.timestamp && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(t.timestamp).toLocaleDateString()} {new Date(t.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50">
        {!selectedThreadId ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 p-4">
            Select a conversation from the list.
          </div>
        ) : loadingMessages ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 p-4">Loading messages…</div>
        ) : (
          <ChatWindow
            selectedChat={selectedChat}
            activeTitle={selectedThreadTitle || "Customer"}
            closeActive={() => setSelectedThreadId(null)}
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
        )}
      </main>
    </div>
  );
};

export default withUserLayout(SupportInboxPage);
