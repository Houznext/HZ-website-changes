"use client";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Lock } from "lucide-react";
import { getSocket } from "../../utils/chat/socket";
import apiClient from "../../utils/apiClient";
import { getTimeHour, useIsBelow1300 } from "../../utils/chat/utilFunctions";
import {
  ChatUser,
  Channel,
  Message,
  ServerMessageNew,
  ServerMessageAck,
  ServerThreadUpdate,
  MessagesByThread,
  ChannelDetails,
  DmUser,
  SendMessageArgs,
  Attachment,
} from "../../utils/chat/types";
import Loader from "@/src/components/SpinLoader";
import { AddChannel } from "./AddChannel";
import { SidebarContent } from "./SidebarContent";
import { ChatWindow } from "./ChatWindow";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Modal from "../../common/Modal";
import Button from "@/src/common/Button";

type BranchUser = {
  id: string;
  firstName: string;
  name?: string;
  phone?: string | null;
  email?: string | null;
  profile?: string | null;
  isBranchHead?: boolean;
};

export default function ChatPanel() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<any>(null);
  const session = useSession();
  const isBelow1300 = useIsBelow1300();
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  const [activeTab, setActiveTab] = useState<"chats" | "channels">("chats");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedChat, setSelectedChat] = useState<DmUser | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const [newMessage, setNewMessage] = useState("");
  const [messagesByThread, setMessagesByThread] = useState<MessagesByThread>(
    {},
  );
  const [activeThreadTheme, setActiveThreadTheme] = useState("classic");
  const [loading, setLoading] = useState(false);

  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  const [dmList, setDmList] = useState<DmUser[]>([] as any);
  const [channelList, setChannelList] = useState<Channel[]>([] as any);
  const [addChannelOpen, setAddChannelOpen] = useState(false);

  const [availableUsers, setAvailableUsers] = useState([] as any[]);
  const [allUsers, setAllUsers] = useState([] as any[]);
  
  const [channelDetails, setChannelDetails] = useState<ChannelDetails | null>(
    null,
  );
  const isDrawerOpen = Boolean(selectedChat || selectedChannel);

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [socketReady, setSocketReady] = useState(false);
  const [readReceiptsByThread, setReadReceiptsByThread] = useState<
    Record<string, any[]>
  >({});
  const initializedRef = useRef(false);
  const [dmToDelete, setDmToDelete] = useState<DmUser | null>(null);
  const [deletingDmId, setDeletingDmId] = useState<string | null>(null);
  const branchId = session.data?.user?.branchMemberships?.[0]?.branchId;

  const getAttachmentKind = (mime?: string | null): Attachment["kind"] => {
    if (!mime) return "file";
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("video/")) return "video";
    if (mime.startsWith("audio/")) return "audio";
    return "file";
  };

  const safeUserId = user?.id || session.data?.user?.id;

  const closeActive = () => {
    setSelectedChat(null);
    setSelectedChannel(null);
    setChannelDetails(null);
    setActiveThreadTheme("classic");
  };

  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const online = new Set(onlineUserIds);
    return dmList
      .map((u) => ({
        ...u,
        status: online.has(u.receiverId || "")
          ? ("online" as const)
          : ("offline" as const),
      }))
      .filter((u) => (u.name || "").toLowerCase().includes(query));
  }, [dmList, searchQuery, onlineUserIds]);

  const filteredAvailableUsers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const online = new Set(onlineUserIds);
    const list = availableUsers.map((u) => ({
      ...u,
      status: online.has(u.id) ? ("online" as const) : ("offline" as const),
    }));
    if (!query) return list;
    return list.filter((u) => (u.name || "").toLowerCase().includes(query));
  }, [availableUsers, searchQuery, onlineUserIds]);

  const filteredChannels = useMemo(
    () =>
      channelList.filter((c: any) =>
        (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [channelList, searchQuery],
  );

  const activeTitle = selectedChat
    ? selectedChat.name
    : selectedChannel
      ? selectedChannel.name
      : "";

  const activeChatWithStatus = useMemo(() => {
    if (!selectedChat) return null;
    return {
      ...selectedChat,
      status: onlineUserIds.includes(selectedChat.receiverId || "")
        ? ("online" as const)
        : ("offline" as const),
    };
  }, [selectedChat, onlineUserIds]);

  const activeThread = useMemo(() => {
    if ((selectedChat as any)?.threadId)
      return { kind: "dm" as const, id: (selectedChat as any).threadId };
    if (selectedChannel)
      return { kind: "channel" as const, id: selectedChannel.id };
    return null;
  }, [selectedChat, selectedChannel]);

  const threadKey = activeThread
    ? `${activeThread.kind}:${activeThread.id}`
    : null;

  const messages = useMemo(() => {
    if (!threadKey) return [];
    return messagesByThread[threadKey] ?? [];
  }, [messagesByThread, threadKey]);

  const canMarkRead = useMemo(() => {
    if (!activeThread) return false;
    if (isBelow1300 && !isDrawerOpen) return false;
    if (typeof document === "undefined") return true;
    return document.visibilityState === "visible" && document.hasFocus();
  }, [activeThread, isBelow1300, isDrawerOpen]);


  const fetchChannelDetails = async (threadId: string) => {
    if (!safeUserId) return null;

    const url =
      `${apiClient.URLS.chat}/threads/${threadId}` +
      `?userId=${encodeURIComponent(safeUserId)}`;


    const res = await apiClient.get(url, {}, true);
    console.log("fetched thread details", res);
    return res.body?.data ?? res.body;
  };

  const refreshChannelDetails = async (threadId: string) => {
    const details = await fetchChannelDetails(threadId);
    if (!details) return null;

    setChannelDetails(details);

    const memberCount = details?.members?.length ?? 0;

    setSelectedChannel((prev) =>
      prev?.id === threadId ? { ...prev, memberCount } : prev,
    );
    setChannelList((prev: any) =>
      prev.map((c: any) => (c.id === threadId ? { ...c, memberCount } : c)),
    );

    return details;
  };

  const handleAddMembers = async (threadId: string, selectedIds: string[]) => {
    if (!safeUserId) return;

    await addMembersToChannel(threadId, selectedIds);
  };

  const addMembersToChannel = async (
    threadId: string,
    selectedIds: string[],
  ) => {
    if (!safeUserId || !selectedIds.length) return;

    try {
      await apiClient.post(
        `${
          apiClient.URLS.chat
        }/channels/${threadId}/members?userId=${encodeURIComponent(
          safeUserId,
        )}`,
        { memberIds: selectedIds },true
      );

      await refreshChannelDetails(threadId);
      toast.success("Members added");
    } catch (e) {
      console.error(e);
      toast.error("Failed to add members");
    }
  };

  const removeMemberFromChannel = async (
    threadId: string,
    removeUserId: string,
  ) => {
    if (!safeUserId) return;

    try {
      await apiClient.delete(
        `${
          apiClient.URLS.chat
        }/channels/${threadId}/members/${removeUserId}?userId=${encodeURIComponent(
          safeUserId,
        )}`,{},true
      );

      await refreshChannelDetails(threadId);

      toast.success("Member removed");
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove member");
    }
  };

  const editChannelDescription = async (
    threadId: string,
    description: string,
  ) => {
    if (!safeUserId) return;
    const newDescription = description.trim();
    if (!newDescription) {
      toast.error("description cannot be empty");
      return;
    }

    try {
      await apiClient.patch(
        `${
          apiClient.URLS.chat
        }/channels/${threadId}/description?userId=${encodeURIComponent(
          safeUserId,
        )}`,
        { description: newDescription },true
      );

      const details = await fetchChannelDetails(threadId);
      if (details) setChannelDetails(details);

      setSelectedChannel((prev) =>
        prev?.id === threadId ? { ...prev, description: newDescription } : prev,
      );
      setChannelList((prev: any) =>
        prev.map((c: any) =>
          c.id === threadId ? { ...c, description: newDescription } : c,
        ),
      );

      toast.success("Channel description updated");
    } catch (err) {
      console.error("Failed to update channel description", err);
      toast.error("Failed to update channel description");
    }
  };
  const editChannelTitle = async (threadId: string, title: string) => {
    if (!safeUserId) return;
    const newTitle = title.trim();
    if (!newTitle) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      await apiClient.patch(
        `${
          apiClient.URLS.chat
        }/channels/${threadId}/title?userId=${encodeURIComponent(safeUserId)}`,
        { title: newTitle },true
      );

      const details = await fetchChannelDetails(threadId);
      if (details) setChannelDetails(details);

      setSelectedChannel((prev) =>
        prev?.id === threadId ? { ...prev, name: newTitle } : prev,
      );
      setChannelList((prev: any) =>
        prev.map((c: any) =>
          c.id === threadId ? { ...c, name: newTitle } : c,
        ),
      );

      toast.success("Channel title updated");
    } catch (err) {
      console.error("Failed to update channel title", err);
      toast.error("Failed to update channel title");
    }
  };

  const deleteChannel = async (threadId: string) => {
    if (!safeUserId) return;

    try {
      await apiClient.delete(
        `${
          apiClient.URLS.chat
        }/channels/${threadId}?userId=${encodeURIComponent(safeUserId)}`,{},true
      );

      setSelectedChannel(null);
      setChannelDetails(null);
      setChannelList((prev: any) => prev.filter((c: any) => c.id !== threadId));
      toast.success("Channel deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete channel");
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!safeUserId || !threadKey) return;
    try {
      await apiClient.delete(
        `${apiClient.URLS.deleteChatMessage}/${messageId}?userId=${encodeURIComponent(safeUserId)}`,{},true
      );

      // Emit socket event for real-time deletion
      if (activeThread) {
        socketRef.current?.emit("message:delete", {
          messageId,
          threadId: activeThread.id,
          threadKind: activeThread.kind,
        });
      }

      setMessagesByThread((prev) => {
        const list = prev[threadKey] ?? [];
        return { ...prev, [threadKey]: list.filter((m) => m.id !== messageId) };
      });
      toast.success("Message deleted");
    } catch (err) {
      console.error("Failed to delete message", err);
      toast.error("Failed to delete message");
    }
  };

  const clearChat = async () => {
    if (!safeUserId || !activeThread || !threadKey) return;

    try {
      await apiClient.delete(
        `${apiClient.URLS.clearChat}/${activeThread.id}/messages?userId=${encodeURIComponent(safeUserId)}`,{},true
      );
      setMessagesByThread((prev) => ({ ...prev, [threadKey]: [] }));
      toast.success("Chat cleared");
    } catch (err) {
      console.error("Failed to clear chat", err);
      toast.error("Failed to clear chat");
    }
  };

  const deleteDmThread = async () => {
    if (!safeUserId || !dmToDelete?.threadId) return;

    const threadId = dmToDelete.threadId;
    try {
      setDeletingDmId(threadId);
      await apiClient.delete(
        `${apiClient.URLS.chatDm}/${threadId}?userId=${encodeURIComponent(safeUserId)}`,{},true
      );

      setDmList((prev) => prev.filter((dm) => dm.threadId !== threadId));
      setMessagesByThread((prev) => {
        const next = { ...prev };
        delete next[`dm:${threadId}`];
        return next;
      });

      if (selectedChat?.threadId === threadId) {
        closeActive();
      }

      const restoredUserId = dmToDelete.receiverId || dmToDelete.id;
      if (restoredUserId) {
        setAvailableUsers((prev) => {
          if (prev.some((u: any) => u.id === restoredUserId)) return prev;
          return [
            {
              id: restoredUserId,
              name: dmToDelete.name,
              status: dmToDelete.status,
              avatarColor: dmToDelete.avatarColor || "bg-blue-500",
            },
            ...prev,
          ];
        });
      }

      toast.success("Chat deleted");
    } catch (err) {
      console.error("Failed to delete chat", err);
      toast.error("Failed to delete chat");
    } finally {
      setDmToDelete(null);
      setDeletingDmId(null);
    }
  };

  const updateDmList = useCallback(
    ({
      threadId,
      message,
      otherUser,
    }: {
      threadId: string;
      message: Message;
      otherUser?: {
        id: string;
        name: string;
        avatarColor?: string;
        status?: any;
      };
    }) => {
      if (!threadId) return;

      setDmList((prev) => {
        const idx = prev.findIndex((d) => d.threadId === threadId);
        const updatedList = [...prev];

        if (idx >= 0) {
          // Exists: update and move to top
          const existing = updatedList[idx];
          const unread =
            message.senderId !== safeUserId
              ? (existing.unreadCount || 0) + 1
              : existing.unreadCount;

          updatedList.splice(idx, 1);
          updatedList.unshift({
            ...existing,
            lastMessage:
              message.content ||
              (message.attachments?.length ? "Attachment" : ""),
            timestamp: message.createdAt || message.timestamp,
            unreadCount: unread,
            id: otherUser?.id || existing.receiverId || existing.id || "", // ensure id exists
          });
        } else if (otherUser) {
          // New: add to top
          updatedList.unshift({
            threadId: threadId,
            name: otherUser.name,
            status: otherUser.status || "offline",
            receiverId: otherUser.id,
            unreadCount: message.senderId !== safeUserId ? 1 : 0,
            lastMessage:
              message.content ||
              (message.attachments?.length ? "Attachment" : ""),
            timestamp: message.createdAt || message.timestamp,
            avatarColor: otherUser.avatarColor || "bg-blue-500",
            id: otherUser.id, // Ensure id is set
          });
        }
        return updatedList;
      });
    },
    [safeUserId],
  );

  // Also update dmList when sending message
  const handleSendMessage = (args?: SendMessageArgs) => {
    const text = (args?.text ?? newMessage).trim();
    const atts = args?.attachments ?? [];
    const effectiveThreadKey = args?.threadKey ?? threadKey;

    // allow sending attachments without text
    const hasSomethingToSend = !!text || atts.length > 0;
    if (!hasSomethingToSend) return;

    if (!activeThread || !effectiveThreadKey) return;

    const socket = socketRef.current;
    if (!socket) return;

    const clientId = `cli-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const optimistic: Message = {
      id: clientId,
      content: text, // can be ""
      senderId: safeUserId || "me",
      senderName: session?.data?.user?.firstName || "You",
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

    // Update local DM list immediately
    if (activeThread.kind === "dm") {
      const threadId = activeThread.id;
      // For new DMs, selectedChat might be the user we are chatting with
      const otherUser = selectedChat
        ? {
            id: selectedChat.receiverId || selectedChat.id, // receiverId might be missing if it's from availableUsers
            name: selectedChat.name,
            avatarColor: selectedChat.avatarColor,
            status: selectedChat.status,
          }
        : undefined;

      updateDmList({
        threadId,
        message: optimistic,
        otherUser,
      });
    }

    socket.emit("message:send", {
      threadKind: activeThread.kind,
      threadId: activeThread.id,
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
      channelId: args?.channelId,
      dmThreadId: args?.dmThreadId,
    });
    if (!args?.text) setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleThemeChange = async (nextTheme: string) => {
    if (!activeThread || !safeUserId) {
      setActiveThreadTheme(nextTheme);
      return;
    }
    setActiveThreadTheme(nextTheme);
    try {
      await apiClient.patch(
        `${apiClient.URLS.chat}/threads/${activeThread.id}/theme?userId=${encodeURIComponent(
          safeUserId,
        )}`,
        { theme: nextTheme },
        true,
      );
    } catch (err) {
      console.error("Failed to update thread theme", err);
    }
  };

  const openDmWithUser = async (u: any) => {
    if (
      selectedChat?.receiverId === u.receiverId &&
      threadKey &&
      messagesByThread[threadKey]?.length > 0
    )
      return;

    setSelectedChannel(null);
    setChannelDetails(null);
    setMessagesByThread({});

    try {
      if (!safeUserId) return;

      let threadId = u.threadId;

      if (!threadId) {
        const dmRes = await apiClient.post(
          `${apiClient.URLS.chatDm}?userId=${encodeURIComponent(safeUserId)}`,
          { otherUserId: u.id }, true
        );

        threadId = dmRes.body?.threadId as string;
        console.log("fetched threadId", threadId);
        if (!threadId)
          throw new Error("threadId missing from /chat/dm response");

        const updated = { ...u, threadId };
        setSelectedChat(updated);

        setDmList((prev: any) =>
          prev.map((x: any) => (x.id === u.id ? updated : x)),
        );
      } else {
        setSelectedChat(u);
      }

      const msgRes = await apiClient.get(
        `${
          apiClient.URLS.chat
        }/threads/${threadId}/messages?userId=${encodeURIComponent(
          safeUserId,
        )}&limit=50`,{},true
      );

      const messagesData =
        msgRes.body?.messages ??
        msgRes.body?.data ??
        (Array.isArray(msgRes.body) ? msgRes.body : []);
        console.log("fetched DM messages", messagesData);
      setActiveThreadTheme(msgRes.body?.threadTheme ?? "classic");
      const history = messagesData
        .map((m: any) => ({
          id: m.id,
          content: m.content ?? "",
          senderId: m.senderId,
          senderName: m.senderName,
          createdAt: m.timestamp,
          timestamp: getTimeHour(m.timestamp),
          isOwn: m.senderId === safeUserId,
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
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );

      const key = `dm:${threadId}`;
      setMessagesByThread((prev) => ({ ...prev, [key]: history }));

      if (msgRes.body?.readReceipts) {
        setReadReceiptsByThread((prev) => ({
          ...prev,
          [key]: msgRes.body.readReceipts,
        }));
      }
    } catch (err) {
      console.error("Failed to open DM", err);
      toast.error("Failed to open DM");
    }
  };

  const openChannel = async (c: Channel) => {
    if (
      selectedChannel?.id === c.id &&
      threadKey &&
      messagesByThread[threadKey]?.length > 0
    )
      return;

    setSelectedChat(null);
    setChannelDetails(null);
    setMessagesByThread({});

    try {
      if (!safeUserId) return;

      const threadId = c.id;
      if (!threadId) throw new Error("channel threadId missing");

      setSelectedChannel(c);

      const details = await fetchChannelDetails(threadId);

      if (details) {
        setChannelDetails(details);

        const memberCount = details?.members?.length ?? c.memberCount ?? 0;

        setSelectedChannel((prev) => (prev ? { ...prev, memberCount } : prev));
        setChannelList((prev: any) =>
          prev.map((x: any) => (x.id === threadId ? { ...x, memberCount } : x)),
        );
      }

      const msgRes = await apiClient.get(
        `${apiClient.URLS.chat}/threads/${threadId}/messages`,
        { userId: safeUserId, limit: 50 },true
      );

      const messagesData =
        msgRes.body?.messages ??
        msgRes.body?.data ??
        (Array.isArray(msgRes.body) ? msgRes.body : []);
      setActiveThreadTheme(msgRes.body?.threadTheme ?? "classic");

      const history = messagesData
        .map((m: any) => ({
          id: m.id,
          content: m.content ?? "",
          senderId: m.senderId,
          senderName: m.senderName ?? "Unknown",
          createdAt: m.timestamp,
          timestamp: getTimeHour(m.timestamp),
          isOwn: m.senderId === safeUserId,
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
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ) as Message[];

      const key = `channel:${threadId}`;

      setMessagesByThread((prev) => ({
        ...prev,
        [key]: history,
      }));

      if (msgRes.body?.readReceipts) {
        setReadReceiptsByThread((prev) => ({
          ...prev,
          [key]: msgRes.body.readReceipts,
        }));
      }
    } catch (err) {
      console.error("Failed to open channel", err);
      toast.error("Failed to open channel");
    }
  };

  const loadThreads = async () => {
    setLoading(true);
    try {
      const id = session.data?.user?.id;
      if (!id) return { receiverIds: [] };

      const url = `${apiClient.URLS.chat}/threads?userId=${encodeURIComponent(
        id,
      )}`;
      const res = (await apiClient.get(url, {}, true)) as any;


      const threads = res?.body ?? [];

      const dms: any[] = threads
        .filter((t: any) => t.kind === "dm")
        .map((t: any) => ({
          threadId: t.id,
          name: t.title ?? "",
          status: "offline",
          receiverId: t.receiverId,
          unreadCount: t.unreadCount,
          lastMessage: t.lastMessage,
          timestamp: t.timestamp,
          avatarColor: "bg-blue-500",
        }))
        .sort((a: any, b: any) => {
          const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return tB - tA;
        });
        console.log("load threads",dms)

      const chans: Channel[] = threads
        .filter((t: any) => t.kind === "channel")
        .map((t: any) => ({
          id: t.id,
          name: t.title ?? "Channel",
          description: t.description ?? "",
          memberCount: t.memberCount ?? 0,
          unreadCount: t.unreadCount ?? 0,
          lastMessage: t.lastMessage ?? "",
          timestamp: t.timestamp ?? "",
        }))
        .sort((a: any, b: any) => {
          const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return tB - tA;
        });

      setDmList(dms as any);
      setChannelList(chans);
      const receiverIds = dms
        .map((dm) => dm.receiverId || dm.id)
        .filter((receiverId): receiverId is string => Boolean(receiverId));
      return { receiverIds };
    } catch (e) {
      console.error("Failed to load threads", e);
      toast.error("Failed to load channels");
      return { receiverIds: [] };
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async (id: string, receiverIds: string[] = []) => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.user}/by-branch/${branchId}/admin-users`,
        {},
        true,
      );

      const rawList = Array.isArray(res.body) ? res.body : [];


      const normalizedUsers: BranchUser[] = rawList.map((item: any) => ({
        id: item.user.id,
        name: item.user.firstName,
        phone: item.user.phone,
        email: item.user.email,
        profile: "/images/user.png",
        isBranchHead: item.membership?.isBranchHead ?? false,
      }));

      const dmUserIds = new Set(receiverIds);
      const filteredUsers = normalizedUsers.filter(
        (u) => u.id !== id && !dmUserIds.has(u.id),
      );
      console.log(filteredUsers,"filtered users");

      setAvailableUsers(filteredUsers);
      setAllUsers(normalizedUsers);
    } catch (e) {
      console.error("Failed to load users", e);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session.status !== "authenticated") return;

    const token = (session.data as any)?.token;
    if (!token) return;

    const init = async () => {
      if (initializedRef.current) return;
      initializedRef.current = true;
      console.log("session data", session.data);

      const user = session.data.user;
      setUser(user);
      setToken(token);
      const { receiverIds } = await loadThreads();
      await loadAllUsers(user?.id as string, receiverIds);
    };

    init();
  }, [session.status, (session.data as any)?.token]);

  useEffect(() => {
    if (!safeUserId) {
      setSocketReady(false);
      return;
    }
    socketRef.current = getSocket({
      userId: safeUserId,
      token: token || undefined,
    });
    setSocketReady(true);
  }, [safeUserId, token]);

  // Fix: Update DM names if they are "Unknown" and we have user data
  useEffect(() => {
    if (
      dmList.length === 0 ||
      (allUsers.length === 0 && availableUsers.length === 0)
    )
      return;

    setDmList((prev) => {
      let changed = false;
      const next = prev.map((dm) => {
        if (
          dm.name === "Unknown User" ||
          dm.name === "" ||
          dm.name === "Unknown"
        ) {
          const found =
            allUsers.find((u) => u.id === dm.receiverId) ||
            availableUsers.find((u) => u.id === dm.receiverId);
          if (found) {
            changed = true;
            return { ...dm, name: found.name };
          }
        }
        return dm;
      });
      return changed ? next : prev;
    });
  }, [allUsers, availableUsers, dmList.length]); // depend on length to avoid loops if objects change

  useEffect(() => {
    if (isBelow1300) {
      setSelectedChat(null);
      setSelectedChannel(null);
      setChannelDetails(null);
    }
  }, [isBelow1300]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    if (!activeThread) return;

    socket.emit("thread:join", {
      kind: activeThread.kind,
      id: activeThread.id,
    });

    // Also mark as read when joining/selecting if visible
    if (canMarkRead) {
      socket.emit("thread:read", {
        threadKind: activeThread.kind,
        threadId: activeThread.id,
      });
    }

    const onMessageNew = (payload: ServerMessageNew) => {
      const key = `${payload.threadKind}:${payload.threadId}`;

      const incoming: Message = {
        id: payload.message.id,
        content: payload.message.content ?? "",
        senderId: payload.message.senderId,
        senderName:
          payload.message.senderName ??
          (payload.message.senderId === safeUserId
            ? "You"
            : payload.message.senderName),
        createdAt: payload.message.timestamp,
        timestamp:
          getTimeHour(payload.message.timestamp) ?? payload.message.timestamp,
        isOwn: payload.message.senderId === safeUserId,
        isImportant: payload.message.isImportant,
        attachments: (payload.message.attachments ?? []).map((a) => ({
          id: a.id,
          url: a.url,
          name: a.fileName ?? "Attachment",
          mimeType: a.mimeType ?? "",
          size: a.sizeBytes ?? 0,
          kind: a.kind ?? getAttachmentKind(a.mimeType),
        })),
      };

      setMessagesByThread((prev) => {
        const list = prev[key] ?? [];
        if (list.some((m) => m.id === incoming.id)) return prev;
        return { ...prev, [key]: [...list, incoming] };
      });

      // If we are looking at this thread, mark as read
      if (
        canMarkRead &&
        payload.threadId === activeThread.id &&
        payload.message.senderId !== safeUserId
      ) {
        socketRef.current?.emit("thread:read", {
          threadKind: payload.threadKind,
          threadId: payload.threadId,
        });
      }

      // Update DM List if DM
      if (payload.threadKind === "dm") {
        const isOwn = payload.message.senderId === safeUserId;
        const otherUserId = isOwn ? null : payload.message.senderId;

        let targetUser = undefined;
        if (!isOwn && otherUserId) {
          targetUser =
            allUsers.find((u) => u.id === otherUserId) ||
            availableUsers.find((u) => u.id === otherUserId);
          if (targetUser) {
            targetUser = {
              id: targetUser.id,
              name: targetUser.name,
              avatarColor: targetUser.avatarColor,
              status: targetUser.status,
            };
          }
          // Fallback if not found in lists (rare if lists loaded)
          if (!targetUser) {
            targetUser = {
              id: otherUserId,
              name: payload.message.senderName || "Unknown",
              avatarColor: "bg-gray-500",
              status: "offline",
            };
          }
        }

        updateDmList({
          threadId: payload.threadId,
          message: incoming,
          otherUser: targetUser,
        });
      }
    };

    const onMessageAck = (payload: ServerMessageAck) => {
      const key = `${payload.threadKind}:${payload.threadId}`;
      setMessagesByThread((prev) => {
        const list = prev[key] ?? [];
        const time = getTimeHour(payload.timestamp) ?? payload.timestamp;

        const next = list.map((m) =>
          m.id === payload.clientId
            ? {
                ...m,
                id: payload.serverId,
                timestamp: time,
                createdAt: payload.timestamp,
              }
            : m,
        );
        return { ...prev, [key]: next };
      });
    };

    const onMessageRead = (payload: any) => {
      const key = `${activeThread.kind}:${activeThread.id}`;
      // Only care about reads in the current active thread for UI purposes
      if (payload.threadId === activeThread.id) {
        setReadReceiptsByThread((prev) => {
          const list = prev[key] ?? [];
          const idx = list.findIndex((r) => r.userId === payload.userId);
          const updated = {
            userId: payload.userId,
            lastReadAt: payload.readAt,
          };

          if (idx === -1) return { ...prev, [key]: [...list, updated] };
          const newList = [...list];
          newList[idx] = updated;
          return { ...prev, [key]: newList };
        });
      }
    };

    socket.on("message:new", onMessageNew);
    socket.on("message:ack", onMessageAck);
    socket.on("message:read", onMessageRead);

    socket.on(
      "message:deleted",
      (payload: {
        messageId: string;
        threadId: string;
        threadKind: string;
      }) => {
        const key = `${payload.threadKind}:${payload.threadId}`;
        setMessagesByThread((prev) => {
          const list = prev[key] ?? [];
          return {
            ...prev,
            [key]: list.filter((m) => m.id !== payload.messageId),
          };
        });
      },
    );

    return () => {
      socket.emit("thread:leave", {
        kind: activeThread.kind,
        id: activeThread.id,
      });
      socket.off("message:new", onMessageNew);
      socket.off("message:ack", onMessageAck);
      socket.off("message:read", onMessageRead);
      socket.off("message:deleted");
    };
  }, [
    activeThread,
    safeUserId,
    socketReady,
    updateDmList,
    allUsers,
    availableUsers,
    canMarkRead,
  ]);

  useEffect(() => {
    if (selectedChat || selectedChannel) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, selectedChat, selectedChannel]);

  useEffect(() => {
    if (!socketReady || !socketRef.current) return;
    const socket = socketRef.current;

    const onThreadUpdate = (t: ServerThreadUpdate) => {
      if (t.kind === "dm") {
        setDmList((prev: DmUser[]) => {
          const idx = prev.findIndex((item) => item.threadId === t.id);
          if (idx === -1) return prev;

          const item = prev[idx];
          const updated: DmUser = {
            ...item,
            lastMessage: t.lastMessage ?? item.lastMessage,
            timestamp: t.timestamp ?? item.timestamp,
            unreadCount: t.unreadCount ?? item.unreadCount,
          };

          const next = [...prev];
          if (t.lastMessage) {
            next.splice(idx, 1);
            return [updated, ...next];
          } else {
            next[idx] = updated;
            return next;
          }
        });
      } else {
        // kind === "channel"
        setChannelList((prev: Channel[]) => {
          const idx = prev.findIndex((item) => item.id === t.id);

          if (idx === -1) {
            return [
              {
                id: t.id,
                name: t.title ?? "Channel",
                description: t.description ?? "",
                memberCount: t.memberCount ?? 0,
                unreadCount: t.unreadCount ?? 0,
                lastMessage: t.lastMessage ?? "",
                timestamp: t.timestamp ?? "",
              } as Channel,
              ...prev,
            ];
          }

          const item = prev[idx];
          const updated: Channel = {
            ...item,
            name: t.title ?? item.name,
            description: t.description ?? item.description,
            lastMessage: t.lastMessage ?? item.lastMessage,
            timestamp: t.timestamp ?? item.timestamp,
            unreadCount: t.unreadCount ?? item.unreadCount,
            memberCount: t.memberCount ?? item.memberCount,
          };

          const next = [...prev];
          if (t.lastMessage) {
            next.splice(idx, 1);
            return [updated, ...next];
          } else {
            next[idx] = updated;
            return next;
          }
        });
      }
    };

    const onPresenceState = ({
      onlineUserIds,
    }: {
      onlineUserIds: string[];
    }) => {
      setOnlineUserIds(onlineUserIds);
    };

    const onUserOnline = ({ userId }: { userId: string }) => {
      setOnlineUserIds((prev) => Array.from(new Set([...prev, userId])));
    };

    const onUserOffline = ({ userId }: { userId: string }) => {
      setOnlineUserIds((prev) => prev.filter((id) => id !== userId));
    };

    socket.on("thread:update", onThreadUpdate);
    socket.on("presence:state", onPresenceState);
    socket.on("user:online", onUserOnline);
    socket.on("user:offline", onUserOffline);

    socket.emit("presence:get");

    return () => {
      socket.off("thread:update", onThreadUpdate);
      socket.off("presence:state", onPresenceState);
      socket.off("user:online", onUserOnline);
      socket.off("user:offline", onUserOffline);
    };
  }, [safeUserId, token, socketReady]);

  // Update DM/Available list statuses when onlineUserIds changes
  // [REMOVED] - Now derived in useMemo for robustness

  if (loading) {
    return (
      <div className="w-full h-full items-center flex justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-theme(spacing.16))] w-full overflow-hidden bg-white">
      <div className="px-4 md:px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-[#3586FF] p-3 shadow-lg shadow-[#3586FF]/20 hover:shadow-[#3586FF]/30 transition-all duration-300 hover:scale-105">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>

          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[#3586FF]">
                Chat Hub
              </h1>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px] shadow-green-400/50" />
            </div>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
              <span className="font-medium">Connect instantly</span>
              <span className="text-gray-400">•</span>
              <span className="text-[#3586FF]">Real-time messaging</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg">
          <Lock className="w-4 h-4 text-[#3586FF] flex-shrink-0" />
          <span className="text-xs text-gray-700 font-medium">Messages are not private and may be visible to administrators</span>
        </div>
      </div>

      <div className="flex h-[calc(100vh-theme(spacing.16)-7rem)] min-h-0">  
        <div className="w-full min-[1300px]:w-96 shrink-0 bg-white flex flex-col h-full min-h-0 border-r border-gray-200 shadow-sm">
          <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 min-h-0 overflow-hidden">
              <SidebarContent
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isSearchFocused={isSearchFocused}
                setIsSearchFocused={setIsSearchFocused}
                filteredUsers={filteredUsers}
                filteredChannels={filteredChannels}
                selectedChat={selectedChat}
                selectedChannel={selectedChannel}
                onSelectChat={(u) => openDmWithUser(u)}
                onSelectChannel={(c) => openChannel(c)}
                onDeleteDm={(u) => setDmToDelete(u)}
                deletingDmId={deletingDmId}
                isAdmin={user?.systemRole === "ADMIN"}
                onClickCreateChannel={() => setAddChannelOpen(true)}
                availableUsers={filteredAvailableUsers}
              />
            </div>
          </div>
        </div>

        <div className="hidden min-[1300px]:flex flex-1 min-w-0 flex-col h-full bg-gray-50 border-none relative overflow-hidden">

          <div className="relative z-10 h-full">
            <ChatWindow
              selectedChat={activeChatWithStatus}
              selectedChannel={selectedChannel}
              activeTitle={activeTitle}
              closeActive={closeActive}
              messagesByThread={messagesByThread}
              messagesEndRef={messagesEndRef}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleKeyDown={handleKeyDown}
              handleSendMessage={handleSendMessage}
              channelDetails={channelDetails}
              currentUserId={safeUserId}
              onEditChannelTitle={editChannelTitle}
              onAddMembers={handleAddMembers}
              onRemoveMember={removeMemberFromChannel}
              onDeleteChannel={deleteChannel}
              onDeleteMessage={deleteMessage}
              onClearChat={clearChat}
              allUsers={allUsers}
              onEditChannelDescription={editChannelDescription}
              readReceipts={readReceiptsByThread[threadKey || ""]}
              threadTheme={activeThreadTheme}
              onThemeChange={handleThemeChange}
            />
          </div>
        </div>

        <AnimatePresence>
          {isDrawerOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close chat"
                onClick={closeActive}
                className="absolute inset-0 z-40 bg-gradient-to-br from-black/40 via-black/30 to-black/20 backdrop-blur-sm min-[1300px]:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              <motion.div
                className="absolute inset-0 z-50 w-full bg-white shadow-2xl min-[1300px]:hidden"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 35,
                  mass: 0.8,
                }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-[#3586FF]" />

                <div className="relative z-10 h-full">
                  <ChatWindow
                    selectedChat={activeChatWithStatus}
                    selectedChannel={selectedChannel}
                    activeTitle={activeTitle}
                    closeActive={closeActive}
                    messagesByThread={messagesByThread}
                    messagesEndRef={messagesEndRef}
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    handleKeyDown={handleKeyDown}
                    handleSendMessage={handleSendMessage}
                    showBackButton
                    channelDetails={channelDetails}
                    currentUserId={safeUserId}
                    onEditChannelTitle={editChannelTitle}
                    onAddMembers={handleAddMembers}
                    onRemoveMember={removeMemberFromChannel}
                    onDeleteChannel={deleteChannel}
                    onDeleteMessage={deleteMessage}
                    onClearChat={clearChat}
                    allUsers={allUsers}
                    onEditChannelDescription={editChannelDescription}
                    readReceipts={readReceiptsByThread[threadKey || ""]}
                    threadTheme={activeThreadTheme}
                    onThemeChange={handleThemeChange}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {safeUserId && (
          console.log(allUsers,"all users"),
          <AddChannel
            open={addChannelOpen}
            onClose={() => setAddChannelOpen(false)}
            users={allUsers.filter((u: any) => u.id !== safeUserId)}
            currentUserId={safeUserId}
            onCreated={({ threadId, title, memberIds }) => {
              setChannelList((prev: any) => [
                {
                  id: threadId,
                  name: title,
                  description: "",
                  memberCount: memberIds.length,
                  unreadCount: 0,
                  lastMessage: "",
                  timestamp: "",
                },
                ...prev,
              ]);
            }}
          />
        )}

        <Modal
          isOpen={!!dmToDelete}
          closeModal={() => setDmToDelete(null)}
          title="Delete chat"
          titleCls="text-center"
          rootCls="flex items-center justify-center z-[9999] max-w-[700px] rounded-lg"
          isCloseRequired={false}
        >
          <p className="text-sm text-gray-600 label-text text-center">
            Delete this chat for both users? All messages and files will be
            removed.
          </p>

          <div className="mt-6 flex justify-end gap-3">
            {/* Secondary Action */}
            <Button
              onClick={() => setDmToDelete(null)}
              disabled={!!deletingDmId}
              className="bg-gray-100 px-3 py-2 rounded-md text-gray-800 hover:bg-gray-200"
            >
              Cancel
            </Button>

            {/* Primary Action */}
            <Button
              onClick={deleteDmThread}
              disabled={!!deletingDmId}
              className="bg-red-600 px-3 py-2 rounded-md text-white hover:bg-red-700"
            >
              {deletingDmId ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
