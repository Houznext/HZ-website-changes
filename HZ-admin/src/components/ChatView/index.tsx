import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import apiClient from "@/src/utils/apiClient";
// import { getChatSocket, disconnectChatSocket } from "@/src/utils/chatSocket";
import { useChatStore, ChatMessage } from "@/src/stores/useChatStore";
import { MessageCircle, Users } from "lucide-react";

import Button from "@/src/common/Button";
import {
  Send,
  ChevronDown,
  Reply,
  Copy,
  Forward,
  Star,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { NewChatModal } from "./NewChatModal";
import { NewGroupModal } from "./NewGroupModal";
import Modal from "@/src/common/Modal";
const makeClientMessageId = () =>
  `${Date.now()}_${Math.random().toString(16).slice(2)}`;

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const isTempId = (id: string) => id.startsWith("-");

function makeStarKey(userId: string) {
  return `chat_starred_${userId}`;
}

function HoverArrow({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="
        opacity-0 group-hover:opacity-100 transition
        w-7 h-7 rounded-full border bg-white shadow-sm
        flex items-center justify-center
        hover:bg-gray-50
      "
      title="Message options"
      type="button"
    >
      <ChevronDown size={16} />
    </Button>
  );
}

function ReplyPreview({
  message,
  onClear,
}: {
  message: ChatMessage;
  onClear: () => void;
}) {
  return (
    <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-[6px] flex items-center justify-between">
      <div className="text-xs text-blue-900">
        <div className="font-semibold">Replying to</div>
        <div className="line-clamp-1 opacity-90">
          {message.text || "[Attachment]"}
        </div>
      </div>
      <Button onClick={onClear} className="text-blue-900" type="button">
        <X size={16} />
      </Button>
    </div>
  );
}

function MessageMenu({
  open,
  onClose,
  mine,
  message,
  isStarred,
  onReply,
  onCopy,
  onForward,
  onStar,
  onEdit,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  mine: boolean;
  message: ChatMessage;
  isStarred: boolean;
  onReply: () => void;
  onCopy: () => void;
  onForward: () => void;
  onStar: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("mousedown", handle);
    return () => window.removeEventListener("mousedown", handle);
  }, [open, onClose]);

  if (!open) return null;

  const temp = isTempId(message.id);
  const canEditDelete = mine && !temp;

  return (
    <div
      ref={ref}
      className="absolute z-50 top-8 right-0 w-44 rounded-[6px] border bg-white shadow-lg overflow-hidden"
    >
      <Button
        className="w-full px-3 py-2 text-left text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
        onClick={() => {
          onReply();
          onClose();
        }}
        type="button"
      >
        <Reply size={16} /> Reply
      </Button>

      <Button
        className="w-full px-3 py-2 text-left text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
        onClick={() => {
          onCopy();
          onClose();
        }}
        type="button"
      >
        <Copy size={16} /> Copy
      </Button>

      <Button
        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
        onClick={() => {
          onForward();
          onClose();
        }}
        type="button"
      >
        <Forward size={16} /> Forward
      </Button>

      <Button
        className="w-full px-3 py-2 text-left text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
        onClick={() => {
          onStar();
          onClose();
        }}
        type="button"
      >
        <Star size={16} /> {isStarred ? "Unstar" : "Star"}
      </Button>

      <div className="h-px bg-gray-100" />

      <Button
        disabled={!canEditDelete}
        className={`w-full px-3 py-2 text-left text-sm font-medium flex items-center gap-2 ${canEditDelete ? "hover:bg-gray-50" : "opacity-40 cursor-not-allowed"
          }`}
        onClick={() => {
          if (canEditDelete) onEdit();
          onClose();
        }}
        type="button"
      >
        <Pencil size={16} /> Edit
      </Button>

      <Button
        disabled={!canEditDelete}
        className={`w-full px-3 py-2 text-left text-sm font-medium flex items-center gap-2 ${canEditDelete
          ? "hover:bg-red-50 text-red-600"
          : "opacity-40 cursor-not-allowed"
          }`}
        onClick={() => {
          if (canEditDelete) onDelete();
          onClose();
        }}
        type="button"
      >
        <Trash2 size={16} /> Delete
      </Button>

      {temp && (
        <div className="px-3 py-2 text-[11px] font-regular text-gray-500 bg-gray-50">
          Message is sending… options will appear after delivery.
        </div>
      )}
    </div>
  );
}

export default function ChatView() {
  const { data: session, status } = useSession();
  const apiToken = session?.user?.token;
  const myId = session?.user?.id ;
  type ChatTab = "chats" | "groups";
  const [activeTab, setActiveTab] = useState<ChatTab>("chats");

  const {
    conversations,
    activeConversationId,
    messagesByConv,
    typingByConv,
    setConversations,
    setActiveConversationId,
    setMessages,
    appendMessage,
    bumpConversation,
    setTyping,
    removeMessage,
    upsertMessage,
  } = useChatStore();

  const socketRef = useRef<any>(null);
  const joinedConvsRef = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const [text, setText] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [replyTo, setReplyTo] = useState<ChatMessage>(null);
  const [editing, setEditing] = useState<ChatMessage>(null);

  const [starred, setStarred] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!myId) return;
    try {
      const raw = localStorage.getItem(makeStarKey(myId.toString()));
      setStarred(raw ? JSON.parse(raw) : {});
    } catch { }
  }, [myId]);

  const persistStarred = (next: Record<string, boolean>) => {
    setStarred(next);
    if (!myId) return;
    localStorage.setItem(makeStarKey(myId.toString()), JSON.stringify(next));
  };

  const normalizeConversationId = (id: string | number) => String(id);

  const upsertConversation = useCallback(
    (incoming: any) => {
      if (!incoming?.id) return;

      setConversations((prev) => {
        const incomingId = normalizeConversationId(incoming.id);
        const existing = prev.find(
          (c) => normalizeConversationId(c.id) === incomingId
        );

        const merged = {
          ...existing,
          ...incoming,
          lastMessage: incoming.lastMessage ?? existing?.lastMessage ?? null,
          unread: incoming.unread ?? existing?.unread ?? 0,
          updatedAt:
            incoming.updatedAt ||
            existing?.updatedAt ||
            new Date().toISOString(),
        };

        const next = existing
          ? prev.map((c) =>
              normalizeConversationId(c.id) === incomingId ? merged : c
            )
          : [merged, ...prev];

        return next.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
    },
    [setConversations]
  );

  const activeMessages: ChatMessage[] =
    activeConversationId &&
    messagesByConv[normalizeConversationId(activeConversationId)]
      ? messagesByConv[normalizeConversationId(activeConversationId)]
      : [];

  const typing = activeConversationId
    ? typingByConv[normalizeConversationId(activeConversationId)]
    : null;

  const messageMap = useMemo(() => {
    const map = new Map<string, ChatMessage>();
    activeMessages.forEach((m) => map.set(m.id, m));
    return map;
  }, [activeMessages]);


  useEffect(() => {
    if (status !== "authenticated") return;

    apiClient
      .get(`${apiClient.URLS.chat}/conversations`, {}, true)
      .then((res) => {
        if (res.status === 200) setConversations(res.body || []);
      });
  }, [status, setConversations]);


  // const connectSocket = useCallback(() => {
  //   if (!apiToken) return;

  //   const s = getChatSocket(apiToken);
  //   socketRef.current = s;

  //   s.off();

  //   s.on("connect", () => {
  //     console.log("socket connected", s.id);
  //     joinedConvsRef.current.clear();
  //   });
  //   s.on("disconnect", (reason: any) => {
  //     console.warn("socket disconnected", reason);
  //   });
  //   s.on("connect_error", (err: any) => {
  //     console.error("socket connect_error", err?.message || err);
  //   });


  //   console.log("Setting up socket listeners");
  //   s.on("message_new", ({ conversationId, message }: any) => {
  //     console.log("message_new received", { conversationId, id: message?.id });
  //     const convKey = normalizeConversationId(conversationId);
  //     setMessages(convKey, (prev: ChatMessage[] = []) => {

  //       if (prev.some((m) => m.id === message.id)) return prev;


  //       if (message.clientMessageId) {
  //         const idx = prev.findIndex(
  //           (m) =>
  //             m.clientMessageId && m.clientMessageId === message.clientMessageId
  //         );
  //         if (idx !== -1) {
  //           const next = [...prev];
  //           next[idx] = { ...message, status: "DELIVERED" };
  //           return next;
  //         }
  //       }

  //       return [...prev, message];
  //     });

  //     bumpConversation(convKey, message, myId);
  //   });

  //   s.on("conversation_deleted", ({ conversationId }) => {
  //     const convKey = normalizeConversationId(conversationId);
  //     setConversations((prev) =>
  //       prev.filter((c) => normalizeConversationId(c.id) !== convKey)
  //     );

  //     if (
  //       activeConversationId &&
  //       normalizeConversationId(activeConversationId) === convKey
  //     ) {
  //       setActiveConversationId(null);
  //     }
  //   });

  //   s.on("typing", ({ conversationId, userId, isTyping }: any) => {
  //     const convKey = normalizeConversationId(conversationId);
  //     setTyping(convKey, userId, isTyping);
  //   });

  //   s.on("read_update", ({ conversationId, userId }: any) => {
  //     const convKey = normalizeConversationId(conversationId);
  //     setMessages(convKey, (prev: ChatMessage[] = []) =>
  //       prev.map((m) =>
  //         m.senderId === myId
  //           ? {
  //             ...m,
  //             seenBy: Array.from(new Set([...(m.seenBy || []), userId])),
  //           }
  //           : m
  //       )
  //     );
  //   });

  //   s.on("message_deleted", ({ conversationId, messageId }: any) => {
  //     const convKey = normalizeConversationId(conversationId);
  //     removeMessage(convKey, messageId);
  //   });

  //   s.on("message_edited", ({ conversationId, message }: any) => {
  //     const convKey = normalizeConversationId(conversationId);
  //     upsertMessage(convKey, message);
  //   });
  // }, [
  //   apiToken,
  //   bumpConversation,
  //   myId,
  //   setMessages,
  //   setTyping,
  //   removeMessage,
  //   upsertMessage,
  // ]);

  useEffect(() => {
    // if (status === "authenticated") connectSocket();
    return () => {
      // disconnectChatSocket();
    };
  }, [status]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !conversations.length) return;

    conversations.forEach((c) => {
      const convKey = normalizeConversationId(c.id);
      if (joinedConvsRef.current.has(convKey)) return;
      socket.emit("join_conversation", { conversationId: convKey });
      joinedConvsRef.current.add(convKey);
    });
  }, [conversations]);

  const openConversationAndLoad = async (convId: string | number) => {
    const convKey = normalizeConversationId(convId);
    setReplyTo(null);
    setEditing(null);
    setOpenMenuId(null);

    setActiveConversationId(convKey);
    if (!joinedConvsRef.current.has(convKey)) {
      socketRef.current?.emit("join_conversation", { conversationId: convKey });
      joinedConvsRef.current.add(convKey);
    }

    setLoadingMsgs(true);
    const res = await apiClient.get(
      `${apiClient.URLS.chat}/conversations/${convKey}/messages`,
      { limit: 30 },
      true
    );

    if (res.status === 200) {
      setMessages(convKey, (prev: ChatMessage[] = []) => {
        const incoming: ChatMessage[] = res.body || [];
        const byId = new Map<string, ChatMessage>();
        [...prev, ...incoming].forEach((m) => byId.set(m.id, m));
        return Array.from(byId.values()).sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

      setHasMore((res.body || []).length === 30);
    }
    setLoadingMsgs(false);
  };

  const loadOlder = async () => {
    if (!activeConversationId || !hasMore || loadingMsgs) return;
    const msgs = messagesByConv[normalizeConversationId(activeConversationId)] || [];
    if (!msgs.length) return;

    setLoadingMsgs(true);
    const cursor = msgs[0].id;

    const res = await apiClient.get(
      `${apiClient.URLS.chat}/conversations/${activeConversationId}/messages`,
      { limit: 30, cursor },
      true
    );

    if (res.status === 200) {
      setMessages(activeConversationId, (prev: ChatMessage[] = []) => {
        const incoming: ChatMessage[] = res.body || [];
        const byId = new Map<string, ChatMessage>();
        [...incoming, ...prev].forEach((m) => byId.set(m.id, m));
        return Array.from(byId.values()).sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
      setHasMore((res.body || []).length === 30);
    }
    setLoadingMsgs(false);
  };

  const copyMessage = async (msg: ChatMessage) => {
    const t = msg.text || "";
    if (!t) return;
    try {
      await navigator.clipboard.writeText(t);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = t;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  const toggleStar = (msg: ChatMessage) => {
    const next = { ...starred };
    if (next[msg.id]) delete next[msg.id];
    else next[msg.id] = true;
    persistStarred(next);
  };

  const startReply = (msg: ChatMessage) => {
    setReplyTo(msg);
    setEditing(null);
  };

  const startEdit = (msg: ChatMessage) => {
    if (msg.senderId !== myId) return;
    if (isTempId(msg.id)) return;
    setEditing(msg);
    setReplyTo(null);
    setText(msg.text || "");
  };

  const cancelEdit = () => {
    setEditing(null);
    setText("");
  };

  const deleteMessage = async (msg: ChatMessage) => {
    if (msg.senderId !== myId) return;
    if (isTempId(msg.id)) return;

    removeMessage(msg.conversationId, msg.id);

    const res = await apiClient.delete(
      `${apiClient.URLS.chat}/messages/${msg.id}`,
      { data: { forEveryone: true } },
      true
    );

    if (res.status !== 200) {
      if (activeConversationId) openConversationAndLoad(activeConversationId);
      return;
    }

    socketRef.current?.emit("message_deleted", {
      conversationId: msg.conversationId,
      messageId: msg.id,
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (isTempId(editing.id)) return;

    const newText = text.trim();
    if (!newText) return;

    const msgId = editing.id;
    const convId = editing.conversationId;

    upsertMessage(convId, { ...editing, text: newText });

    const res = await apiClient.patch(
      `${apiClient.URLS.chat}/messages/${msgId}`,
      { text: newText },
      true
    );

    if (res.status === 200) {
      upsertMessage(convId, res.body);
      socketRef.current?.emit("message_edited", {
        conversationId: convId,
        message: res.body,
      });
    } else {
      openConversationAndLoad(convId);
    }

    setEditing(null);
    setText("");
  };
  const filteredConversations = useMemo(() => {
    if (activeTab === "groups") {
      return conversations.filter((c) => c.type === "GROUP");
    }
    return conversations.filter((c) => c.type === "DIRECT");
  }, [conversations, activeTab]);

  const send = () => {
    if (!activeConversationId || !text.trim()) return;

    if (editing) {
      saveEdit();
      return;
    }

    const convId = activeConversationId;
    const tempId = `-${Date.now()}`;

    const clientMessageId = makeClientMessageId();

    const sendingText = text.trim();
    const replyId = replyTo?.id ?? undefined;

    const tempMsg: ChatMessage = {
      id: tempId,
      conversationId: convId,
      text: sendingText,
      senderId: myId!.toString(),
      createdAt: new Date().toISOString(),
      type: "TEXT",
      status: "SENT",
      seenBy: [],
      replyToMessageId: replyId ?? null,
      clientMessageId,
    };

    appendMessage(convId, tempMsg);
    bumpConversation(convId, tempMsg, myId);

    setText("");
    setReplyTo(null);

    console.log("send_message emit", {
      connected: socketRef.current?.connected,
      socketId: socketRef.current?.id,
      conversationId: convId,
    });
    socketRef.current?.emit(
      "send_message",
      {
        conversationId: convId,
        payload: {
          text: sendingText,
          type: "TEXT",
          replyToMessageId: replyId,
          clientMessageId,
        },
      },
      (ack: any) => {
        const saved: ChatMessage = ack?.message ?? ack;
        if (!saved?.id) return;

        const savedWithClient = { ...saved, clientMessageId };

        setMessages(convId, (prev: ChatMessage[] = []) =>
          prev.map((m) =>
            m.clientMessageId === clientMessageId
              ? { ...savedWithClient, status: "DELIVERED" }
              : m
          )
        );

        bumpConversation(
          convId,
          { ...savedWithClient, status: "DELIVERED" },
          myId
        );
      }
    );
  };

  useEffect(() => {
    if (!activeConversationId) return;
    const t = setTimeout(() => {
      socketRef.current?.emit("typing", {
        conversationId: activeConversationId,
        isTyping: !!text && !editing,
      });
    }, 250);
    return () => clearTimeout(t);
  }, [text, activeConversationId, editing]);

  useEffect(() => {
    if (!conversations.length) return;
    if (activeConversationId) return;
    openConversationAndLoad(conversations[0].id);
  }, [conversations]);

  if (status !== "authenticated") return <div>Login required</div>;
  const deleteConversation = async (
    conversationId: string,
    forEveryone = true
  ) => {
    if (!conversationId) return;

    setConversations((prev) => prev.filter((c) => c.id !== conversationId));

    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
    }

    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.chat}/conversations/${conversationId}`,
        { forEveryone }, // becomes ?forEveryone=true
        true
      );

      if (res.status === 200) {
        socketRef.current?.emit("conversation_deleted", {
          conversationId,
        });
      }
    } catch (err) {
      console.error("Delete failed", err);

      // rollback: reload conversations
      const reload = await apiClient.get(
        `${apiClient.URLS.chat}/conversations`,
        {},
        true
      );
      if (reload.status === 200) {
        setConversations(reload.body || []);
      }
    }
  };

  const activeConversation = conversations.find(
    (c) =>
      activeConversationId &&
      normalizeConversationId(c.id) ===
        normalizeConversationId(activeConversationId)
  );
  let lastDate = "";

  return (
    <div className="h-[calc(100vh-80px)] w-full  flex bg-gray-50">
      <div className="w-[340px] bg-white border-r flex flex-col">
        <div className="border-b">
          <div className="md:p-4 p-2 flex md:flex-row flex-col gap-2 ">
            <div className="font-bold text-base">Messages</div>
            <div className="flex gap-2">
              <Button
                onClick={() => setNewChatOpen(true)}
                className="px-3 py-1 rounded-lg btn-text text-nowrap border text-[12px]"
              >
                + Chat
              </Button>

              <Button
                onClick={() => setNewGroupOpen(true)}
                className="px-3 py-1 rounded-lg btn-text text-nowrap bg-blue-500 text-white text-[12px]"
              >
                + Group
              </Button>
            </div>
          </div>

          <div className="flex md:px-4 px-2 md:pb-2 pb-1 gap-6">
            <Button
              onClick={() => setActiveTab("chats")}
              className={`flex items-center gap-2 py-1 label-text font-medium transition ${activeTab === "chats"
                ? "border-b-2 border-blue-500  text-blue-500"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <MessageCircle size={16} />
              Chats
            </Button>

            <Button
              onClick={() => setActiveTab("groups")}
              className={`flex items-center gap-2 py-1 label-text font-medium transition ${activeTab === "groups"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <Users size={16} />
              Groups
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {filteredConversations.map((c) => {
            const isActive =
              activeConversationId &&
              normalizeConversationId(c.id) ===
                normalizeConversationId(activeConversationId);

            const lastText =
              c.lastMessage?.text ||
              (() => {
                const msgs = messagesByConv[c.id];
                if (msgs?.length)
                  return msgs[msgs.length - 1].text || "[Attachment]";
                return "No messages yet";
              })();

            return (
              <div
                key={c.id}
                onClick={() => openConversationAndLoad(c.id)}
                className={`cursor-pointer p-3 border-b hover:bg-gray-50 ${isActive ? "bg-blue-50" : ""
                  }`}
              >
                <div className="flex justify-between items-center">
                  <div className="truncate font-medium text-sm">
                    {c.title || `Chat #${c.id}`}
                  </div>
                  {!!c.unread && c.unread > 0 && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                      {c.unread}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                  {lastText}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex-1 w-full flex flex-col">
        <div className="h-[56px] bg-white border-b flex items-center justify-between px-4">
          <div className="font-bold subheading-text ">
            {activeConversation?.title || "Select a chat"}
            {typing?.isTyping && typing.userId !== myId && (
              <span className="ml-3 text-xs text-gray-500">typing...</span>
            )}
          </div>

          {activeConversationId && (
            <button
              onClick={() => setOpenDeleteModal(true)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-red-600"
              title="Delete chat"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
        <Modal
          isOpen={openDeleteModal}
          closeModal={() => setOpenDeleteModal(false)}
          title=""
          className="md:max-w-[500px] max-w-[330px]"
          rootCls="flex items-center justify-center z-[9999]"
          isCloseRequired={true}
        >
          <div className="p-6">
            <h3 className="md:text-[20px] text-[14px]  subheading-text text-center font-medium text-gray-900 mb-2">
              Delete Conversation
            </h3>

            <p className="md:text-sm text-[12px] text-center font-medium text-gray-500 mb-6">
              Choose how you want to delete this chat.
            </p>

            <div className="space-y-3 flex md:flex-row items-center  flex-col md:space-x-2">
              <Button
                onClick={() => {
                  deleteConversation(activeConversationId!, false);
                  setOpenDeleteModal(false);
                }}
                className="w-full md:px-5 px-3 py-1  border   font-medium btn-txt hover:bg-gray-200 text-gray-800"
              >
                Delete for me
              </Button>

              <Button
                onClick={() => {
                  deleteConversation(activeConversationId!, true);
                  setOpenDeleteModal(false);
                }}
                className="w-full md:px-5 px-3 py-1 border  text-blue-500 btn-txt font-medium"
              >
                Delete for everyone
              </Button>
            </div>

            {/* <Button
              className="md:px-5 px-3 py-1 font-medium border  bg-transparent text-gray-500 btn-txt
         hover:text-gray-700"
              onClick={() => setOpenDeleteModal(false)}
            >
              Cancel
            </Button> */}
          </div>
        </Modal>

        <div
          ref={scrollRef}
          onScroll={(e) => e.currentTarget.scrollTop === 0 && loadOlder()}
          className="flex-1 overflow-y-auto p-4 space-y-2"
        >
          {loadingMsgs && !activeMessages.length && (
            <div className="text-sm text-gray-500">Loading…</div>
          )}

          {activeMessages.map((m) => {
            const dateLabel = formatDateLabel(m.createdAt);
            const showDate = dateLabel !== lastDate;
            lastDate = dateLabel;

            const mine = m.senderId === myId;
            const isStarred = !!starred[m.id];

            const replied = m.replyToMessageId
              ? messageMap.get(m.replyToMessageId)
              : null;

            return (
              <div key={m.id}>
                {showDate && (
                  <div className="text-center text-[#5297ff] my-3 font-bold text-sm">
                    {dateLabel}
                  </div>
                )}

                <div
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div className="relative group flex items-start gap-2">
                    <div className={`${mine ? "order-2" : "order-1"} mt-1`}>
                      <HoverArrow
                        onClick={() =>
                          setOpenMenuId(openMenuId === m.id ? null : m.id)
                        }
                      />
                    </div>

                    <div
                      className={`order-1 px-3 py-2 rounded-2xl font-medium text-sm max-w-[70%] ${mine ? "bg-blue-500 text-white" : "bg-white border"
                        }`}
                    >
                      {replied && (
                        <div
                          className={`mb-2 px-2 py-1 rounded-lg text-xs border ${mine
                            ? "border-blue-400/40 bg-blue-500/20"
                            : "border-gray-200 bg-gray-50"
                            }`}
                        >
                          <div className="font-semibold opacity-90">Reply</div>
                          <div className="line-clamp-1 opacity-90">
                            {replied.text || "[Attachment]"}
                          </div>
                        </div>
                      )}

                      <div className="whitespace-pre-wrap break-words">
                        {m.text}
                      </div>

                      <div className="mt-1 flex items-center justify-end gap-2 text-[10px] opacity-80">
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>

                        {mine && (
                          <span>
                            {m.status === "DELIVERED" ? "✔" : "⏳"}
                            {m.seenBy?.length ? "✔✔" : ""}
                          </span>
                        )}

                        {isStarred && <span title="Starred">⭐</span>}
                      </div>
                    </div>

                    <MessageMenu
                      open={openMenuId === m.id}
                      onClose={() => setOpenMenuId(null)}
                      message={m}
                      mine={mine}
                      isStarred={isStarred}
                      onReply={() => setReplyTo(m)}
                      onForward={() => copyMessage(m)}
                      onCopy={() => copyMessage(m)}
                      onStar={() => toggleStar(m)}
                      onEdit={() => startEdit(m)}
                      onDelete={() => deleteMessage(m)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>


        <div className="border-t bg-white p-3 space-y-2">
          {replyTo && (
            <ReplyPreview message={replyTo} onClear={() => setReplyTo(null)} />
          )}

          {editing && (
            <div className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-[6px] flex items-center justify-between">
              <div className="text-xs font-semibold text-yellow-900">
                Editing message
              </div>
              <Button
                onClick={cancelEdit}
                className="text-xs text-yellow-900 underline"
                type="button"
              >
                Cancel
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              className="flex-1 border rounded-[6px] px-3  label-text outline-none "
              placeholder={editing ? "Edit message..." : "Type a message..."}
              disabled={!activeConversationId}
            />

            <Button
              onClick={send}
              disabled={!activeConversationId || !text.trim()}
              className="bg-blue-500 text-white rounded-[6px] px-4"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>

      <NewChatModal
        isOpen={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onOpenConversation={openConversationAndLoad}
        onConversationCreated={upsertConversation}
      />
      <NewGroupModal
        isOpen={newGroupOpen}
        onClose={() => setNewGroupOpen(false)}
        onOpenConversation={openConversationAndLoad}
        onConversationCreated={upsertConversation}
      />
    </div>
  );
}
