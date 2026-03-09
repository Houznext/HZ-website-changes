import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import withAdminLayout from "@/src/common/AdminLayout";
import apiClient from "@/src/utils/apiClient";
import { getSocket } from "@/src/utils/chat/socket";
import { ChatWindow } from "@/src/components/ChatPanel/ChatWindow";
import Loader from "@/src/common/Loader";
import {
  Attachment,
  DmUser,
  Message,
  MessagesByThread,
  SendMessageArgs,
} from "@/src/utils/chat/types";
import { getTimeHour } from "@/src/utils/chat/utilFunctions";

const WorkProgressChat = () => {
  const router = useRouter();

  const builderId = useMemo(() => {
    const rawUserId = router.query.userId;
    if (typeof rawUserId === "string") return rawUserId;
    if (Array.isArray(rawUserId)) return rawUserId[0] ?? "";
    return "";
  }, [router.query.userId]);

  console.log("WorkProgressChat mounted with builderId:", builderId);
  const { data: session, status } = useSession();
  const adminId = session?.user?.id as string | undefined;
  const token = (session as any)?.token as string | undefined;

  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(() => new Set());
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("Customer");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messagesByThread, setMessagesByThread] = useState<MessagesByThread>(
    {},
  );
  const [threadTheme, setThreadTheme] = useState<string>("classic");
  const [readReceiptsByThread, setReadReceiptsByThread] = useState<
    Record<string, any[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const threadKey = useMemo(
    () => (threadId ? `dm:${threadId}` : null),
    [threadId],
  );

  const selectedChat = useMemo<DmUser | null>(() => {
    if (!customerId || !threadId) return null;
    return {
      id: customerId,
      receiverId: customerId,
      name: customerName || "Customer",
      status: onlineUserIds.has(customerId) ? "online" : "offline",
      avatarColor: "bg-blue-500",
      threadId,
    };
  }, [customerId, customerName, threadId, onlineUserIds]);

  const activeTitle = selectedChat?.name ?? "Chat";

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
    if (status === "authenticated" && adminId) {
      socketRef.current = getSocket({ userId: adminId, token });
    }
  }, [status, adminId, token]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || status !== "authenticated" || !adminId) return;

    const onPresenceState = (payload: any) => {
      const ids = Array.isArray(payload?.onlineUserIds) ? payload.onlineUserIds : [];
      setOnlineUserIds(new Set(ids.filter((x: any) => typeof x === "string")));
    };
    const onUserOnline = (payload: any) => {
      const id = payload?.userId;
      if (typeof id !== "string") return;
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    };
    const onUserOffline = (payload: any) => {
      const id = payload?.userId;
      if (typeof id !== "string") return;
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    };

    socket.on("presence:state", onPresenceState);
    socket.on("user:online", onUserOnline);
    socket.on("user:offline", onUserOffline);
    socket.emit("presence:get");

    return () => {
      socket.off("presence:state", onPresenceState);
      socket.off("user:online", onUserOnline);
      socket.off("user:offline", onUserOffline);
    };
  }, [status, adminId]);

  useEffect(() => {
    const fetchCustomer = async () => {
      console.log("Fetching customer details for builderId:", builderId);
      if (!router.isReady || !builderId) return;
      setError("");
      try {
        const res = await apiClient.get(
          `${apiClient.URLS.custom_builder}/${builderId}`,
          {},
          true,
        );
        console.log("Fetched customer details:", res?.body);
        const user = res?.body?.user || res?.body?.customer || res?.body?.owner;
        const userId = user?.id || res?.body?.userId;
        if (userId) {
          setCustomerId(userId);
          const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
          setCustomerName(name || user?.email || "Customer");
        } else {
          setError("Customer user id not found for this builder.");
        }
      } catch (err: any) {
        console.error("Failed to load customer details", err);
        setError(err?.message || "Failed to load customer details.");
      }
    };

    fetchCustomer();
  }, [builderId, router.isReady]);

  useEffect(() => {
    const fetchThread = async () => {
      if (!adminId || !customerId) return;
      setLoading(true);
      setError("");
      try {
        const dmRes = await apiClient.post(
          `${apiClient.URLS.chatDm}?userId=${encodeURIComponent(adminId)}`,
          { otherUserId: customerId },
          true,
        );
        const nextThreadId = dmRes.body?.threadId as string | undefined;
        if (!nextThreadId) {
          throw new Error("Thread id missing for customer chat.");
        }
        setThreadId(nextThreadId);

        const msgRes = await apiClient.get(
          `${apiClient.URLS.chat}/threads/${nextThreadId}/messages?userId=${encodeURIComponent(
            adminId,
          )}&limit=50`,
          {},
          true,
        );
        const rawMessages =
          msgRes.body?.messages ??
          msgRes.body?.data ??
          (Array.isArray(msgRes.body) ? msgRes.body : []);
        setThreadTheme(msgRes.body?.threadTheme ?? "classic");
        const mapped = (rawMessages as any[])
          .map((m) => ({
            id: m.id,
            content: m.content ?? "",
            senderId: m.senderId,
            senderName: m.senderName ?? "Unknown",
            createdAt: m.timestamp,
            timestamp: getTimeHour(m.timestamp),
            isOwn: m.senderId === adminId,
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
          .sort(
            (a: any, b: any) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime(),
          );
        const key = `dm:${nextThreadId}`;
        setMessagesByThread((prev) => ({ ...prev, [key]: mapped }));

        if (msgRes.body?.readReceipts) {
          setReadReceiptsByThread((prev) => ({
            ...prev,
            [key]: msgRes.body.readReceipts,
          }));
        }
      } catch (err: any) {
        console.error("Failed to load chat thread", err);
        setError(err?.message || "Failed to load chat thread.");
      } finally {
        setLoading(false);
      }
    };

    fetchThread();
  }, [adminId, customerId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !threadId || !adminId) return;

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
        isOwn: payload.message.senderId === adminId,
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

      if (payload.message.senderId !== adminId) {
        socket.emit("thread:read", { threadKind: "dm", threadId });
      }
    };

    const onMessageAck = (payload: any) => {
      if (payload?.threadId !== threadId) return;
      setMessagesByThread((prev) => {
        const key = `dm:${threadId}`;
        const list = prev[key] ?? [];
        return {
          ...prev,
          [key]: list.map((m) =>
            m.id === payload.clientId
              ? {
                ...m,
                id: payload.serverId,
                createdAt: payload.timestamp,
                timestamp: getTimeHour(payload.timestamp),
              }
              : m,
          ),
        };
      });
    };

    socket.on("message:new", onMessageNew);
    socket.on("message:ack", onMessageAck);

    return () => {
      socket.emit("thread:leave", { kind: "dm", id: threadId });
      socket.off("message:new", onMessageNew);
      socket.off("message:ack", onMessageAck);
    };
  }, [threadId, adminId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSendMessage = useCallback(
    (args?: SendMessageArgs) => {
      const text = (args?.text ?? newMessage).trim();
      const atts = args?.attachments ?? [];
      const effectiveThreadKey = args?.threadKey ?? threadKey;

      const hasSomethingToSend = !!text || atts.length > 0;
      if (!hasSomethingToSend) return;

      if (!adminId || !threadId || !effectiveThreadKey) return;

      const socket = socketRef.current;
      if (!socket) return;

      const clientId = `cli-${Date.now()}`;
      const timestamp = new Date().toISOString();
      const optimistic: Message = {
        id: clientId,
        content: text,
        senderId: adminId,
        senderName: session?.user?.firstName || "You",
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

      setMessagesByThread((prev) => {
        const list = prev[effectiveThreadKey] ?? [];
        return { ...prev, [effectiveThreadKey]: [...list, optimistic] };
      });

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
    [adminId, threadId, threadKey, newMessage, session?.user?.firstName],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const closeActive = () => router.back();
  const handleThemeChange = async (nextTheme: string) => {
    if (!threadId || !adminId) {
      setThreadTheme(nextTheme);
      return;
    }
    setThreadTheme(nextTheme);
    try {
      await apiClient.patch(
        `${apiClient.URLS.chat}/threads/${threadId}/theme?userId=${encodeURIComponent(
          adminId,
        )}`,
        { theme: nextTheme },
        true,
      );
    } catch (err) {
      console.error("Failed to update thread theme", err);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-theme(spacing.16))]">
      {error && (
        <div className="px-4 py-2 text-sm text-red-600 bg-red-50 border-b border-red-100">
          {error}
        </div>
      )}
      {loading || !threadId ? (
        <Loader />
      ) : (
        <ChatWindow
          selectedChat={selectedChat}
          selectedChannel={null}
          activeTitle={activeTitle}
          closeActive={closeActive}
          messagesByThread={messagesByThread}
          messagesEndRef={messagesEndRef}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleKeyDown={handleKeyDown}
          handleSendMessage={handleSendMessage}
          showBackButton
          currentUserId={adminId}
          readReceipts={threadKey ? readReceiptsByThread[threadKey] : []}
          threadTheme={threadTheme}
          onThemeChange={handleThemeChange}
        />
      )}
    </div>
  );
};

export default withAdminLayout(WorkProgressChat);
