"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Users,
  ArrowLeft,
  MessageSquare,
  Paperclip,
  Smile,
  Send,
  CheckCheck,
  AlertCircle,
  Info,
  X,
  Pencil,
  UserPlus,
  Trash2,
  Search,
  FileText,
  Upload,
} from "lucide-react";

import {
  getStatusColor,
  getStatusText,
  IconBtn,
  initials,
} from "../../utils/chat/utilFunctions";

import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { TextInput } from "../../common/form/TextInput";
import { Textarea } from "../../common/form/Textarea";
import { Field } from "../../common/form/Field";

import {
  Channel,
  ChatUser,
  MessagesByThread,
  ChannelDetails,
} from "../../utils/chat/types";

import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import toast from "react-hot-toast";
import { uploadFile } from "../../utils/uploadFile";

type Attachment = {
  id: string;
  name: string;
  url: string;
  kind?: "image" | "video" | "audio" | "file";
  mimeType?: string;
  size?: number;
};

const isImage = (mime?: string) => !!mime && mime.startsWith("image/");
const prettyBytes = (bytes?: number) => {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

export function ChatWindow({
  selectedChat,
  selectedChannel,
  activeTitle,
  closeActive,
  messagesByThread,
  messagesEndRef,
  newMessage,
  setNewMessage,
  handleKeyDown,
  handleSendMessage,
  showBackButton = false,
  channelDetails,
  currentUserId,
  onEditChannelTitle,

  onEditChannelDescription,

  onAddMembers,
  onRemoveMember,
  onDeleteChannel,
  onDeleteMessage,
  onClearChat,
  allUsers,
  readReceipts = [],
  threadTheme,
  onThemeChange,
}: {
  selectedChat: ChatUser | null;
  selectedChannel: Channel | null;
  activeTitle: string;
  closeActive: () => void;
  messagesByThread: MessagesByThread | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  newMessage: string;
  setNewMessage: (v: any) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSendMessage: (...args: any[]) => void;
  showBackButton?: boolean;

  channelDetails?: (ChannelDetails & { description?: string | null }) | null;
  currentUserId?: string;

  onEditChannelTitle?: (
    threadId: string,
    title: string,
  ) => Promise<void> | void;

  onEditChannelDescription?: (
    threadId: string,
    description: string,
  ) => Promise<void> | void;

  onAddMembers?: (threadId: string, ids: string[]) => void;
  onRemoveMember?: (threadId: string, removeUserId: string) => void;
  onDeleteChannel?: (threadId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onClearChat?: () => void;
  allUsers?: any;
  readReceipts?: any[];
  threadTheme?: string | null;
  onThemeChange?: (themeId: string) => void;
}) {
  const hasActive = Boolean(selectedChat || selectedChannel);
  const themes = [
    {
      id: "classic",
      label: "Classic",
      pageBg: "bg-gradient-to-b from-white via-blue-50/5 to-transparent",
      chatBg: "bg-[#F0F2F5]",
      ownBubble: "bg-[#D9FDD3] text-gray-900",
      otherBubble: "bg-white text-gray-900",
      ownMetaText: "text-blue-100/90",
      otherMetaText: "text-gray-500",
      bannerBg: "bg-[#F0F2F5]/95",
    },
    {
      id: "ocean",
      label: "Ocean",
      pageBg: "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700",
      chatBg: "bg-slate-900/80",
      ownBubble: "bg-sky-600 text-white",
      otherBubble: "bg-slate-800 text-slate-100",
      ownMetaText: "text-sky-100/90",
      otherMetaText: "text-slate-300",
      bannerBg: "bg-slate-900/80",
    },
    {
      id: "sunset",
      label: "Sunset",
      pageBg: "bg-gradient-to-b from-rose-50 via-orange-50 to-amber-50",
      chatBg: "bg-rose-50/70",
      ownBubble: "bg-rose-500 text-white",
      otherBubble: "bg-white text-rose-900",
      ownMetaText: "text-rose-100/90",
      otherMetaText: "text-rose-700",
      bannerBg: "bg-rose-50/80",
    },
    {
      id: "mint",
      label: "Mint",
      pageBg: "bg-gradient-to-b from-gray-50 via-teal-50 to-cyan-50",
      chatBg: "bg-white-50/70",
      ownBubble: "bg-gray-600 text-white",
      otherBubble: "bg-white text-gray-900",
      ownMetaText: "text-gray-100/90",
      otherMetaText: "text-gray-700",
      bannerBg: "bg-gray-50/80",
    },
  ];
  const [themeId, setThemeId] = useState("classic");
  const activeTheme = useMemo(
    () => themes.find((t) => t.id === themeId) ?? themes[0],
    [themeId],
  );

  useEffect(() => {
    if (threadTheme && themes.some((t) => t.id === threadTheme)) {
      setThemeId(threadTheme);
    } else {
      setThemeId("classic");
    }
  }, [threadTheme]);

  const [isChannelInfoOpen, setIsChannelInfoOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [descDraft, setDescDraft] = useState("");
  const [savingDesc, setSavingDesc] = useState(false);

  const [showAddMembers, setShowAddMembers] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [savingMembers, setSavingMembers] = useState(false);

  const [titleDraft, setTitleDraft] = useState("");

  const isChannel = Boolean(selectedChannel);
  const isAdmin = Boolean(channelDetails?.isOwner);

  const memberCount =
    channelDetails?.members?.length ?? selectedChannel?.memberCount ?? 0;

  const [showEmoji, setShowEmoji] = useState(false);
  const emojiWrapRef = useRef<HTMLDivElement | null>(null);

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [isImportant, setIsImportant] = useState(false);

  const [showAttachMenu, setShowAttachMenu] = useState(false);

  // Deletion modals state
  const [deleteMsgId, setDeleteMsgId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const onPickFile = () => {
    setShowAttachMenu(false);
    fileInputRef.current?.click();
  };

  const openChannelInfo = () => {
    setIsChannelInfoOpen(true);
    setIsEditingTitle(false);
    setTitleDraft(channelDetails?.title ?? selectedChannel?.name ?? "");
    // ✅ NEW: init description draft when opening channel info
    setDescDraft((channelDetails as any)?.description ?? "");
  };

  const closeChannelInfo = () => {
    setIsChannelInfoOpen(false);
    setIsEditingTitle(false);
  };

  const threadKey = useMemo(() => {
    if (!selectedChat && !selectedChannel) return null;
    if (selectedChat && (selectedChat as any).threadId)
      return `dm:${(selectedChat as any).threadId}`;
    if (selectedChannel) return `channel:${selectedChannel.id}`;
    return null;
  }, [selectedChat, selectedChannel]);

  const existingMemberIds = useMemo(() => {
    const ids = new Set<string>();
    (channelDetails?.members ?? []).forEach((m) => ids.add(m.userId));
    return ids;
  }, [channelDetails]);

  const addableUsers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    return (allUsers ?? [])
      .filter((u: any) => {
        if (existingMemberIds.has(u.id)) return false;
        if (currentUserId && u.id === currentUserId) return false;
        if (!q) return true;
        return (
          (u.name ?? "").toLowerCase().includes(q) ||
          (u.email ?? "").toLowerCase().includes(q)
        );
      })
      .slice(0, 200);
  }, [allUsers, existingMemberIds, memberSearch, currentUserId]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const saveDescription = async () => {
    if (!selectedChannel) return;
    if (!onEditChannelDescription) return;

    try {
      setSavingDesc(true);
      await onEditChannelDescription(selectedChannel.id, descDraft.trim());
      toast.success("Description updated");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to update description");
    } finally {
      setSavingDesc(false);
    }
  };

  const submitAddMembers = async () => {
    if (!selectedChannel) return;
    if (!selectedIds.length) return;
    if (!onAddMembers) return;

    try {
      setSavingMembers(true);

      // ✅ NEW: if admin edited description here, save it before adding members
      const currentDesc = ((channelDetails as any)?.description ?? "").trim();
      const nextDesc = descDraft.trim();

      if (isAdmin && onEditChannelDescription && currentDesc !== nextDesc) {
        await onEditChannelDescription(selectedChannel.id, nextDesc);
      }

      await onAddMembers(selectedChannel.id, selectedIds);
      setShowAddMembers(false);
      setSelectedIds([]);
    } finally {
      setSavingMembers(false);
    }
  };

  useEffect(() => {
    if (!isChannelInfoOpen) return;
    setTitleDraft(channelDetails?.title ?? selectedChannel?.name ?? "");
    setDescDraft((channelDetails as any)?.description ?? "");
  }, [
    isChannelInfoOpen,
    channelDetails?.title,
    (channelDetails as any)?.description,
    selectedChannel?.name,
  ]);

  // ✅ Close emoji picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        emojiWrapRef.current &&
        !emojiWrapRef.current.contains(e.target as Node)
      ) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ✅ Close emoji picker on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowEmoji(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // ✅ Reset attachments when changing thread
  useEffect(() => {
    setAttachments([]);
    setUploadProgress(0);
    setUploading(false);
    setShowEmoji(false);
    setIsImportant(false);
  }, [threadKey]);

  // ✅ Emoji click -> append to input
  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev: string) => (prev ?? "") + (emojiData.emoji ?? ""));
  };

  // ✅ Handle upload
  const onFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";

    if (!files.length) return;

    const MAX_FILES = 5;
    if (attachments.length + files.length > MAX_FILES) {
      toast.error(`Max ${MAX_FILES} files per message.`);
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        setUploadProgress(0);

        const url = await uploadFile(f, "chat", undefined, undefined, (p) =>
          setUploadProgress(p),
        );

        if (!url) continue;

        setAttachments((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            name: f.name,
            url,
            mimeType: f.type,
            size: f.size,
          },
        ]);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // ✅ Send message (text + attachments)
  const onSend = () => {
    if (uploading) return;

    const textOk = !!newMessage.trim();
    const filesOk = attachments.length > 0;

    if (!textOk && !filesOk) return;

    try {
      handleSendMessage({
        text: newMessage.trim(),
        attachments,
        threadKey,
        channelId: selectedChannel?.id,
        dmThreadId: (selectedChat as any)?.threadId,
        isImportant,
      });
    } catch {
      handleSendMessage();
    }

    setNewMessage("");
    setAttachments([]);
    setShowEmoji(false);
    setIsImportant(false);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleKeyDown(e);
  };

  return (
    <div
      className={`flex-1 min-w-0 flex flex-col w-full h-full min-h-0 overflow-hidden ${activeTheme.pageBg}`}
    >
      {/* HEADER */}
      <div className="bg-white/90 backdrop-blur-sm px-3 py-2.5 shadow-sm">
        {hasActive ? (
          <div className="flex items-center justify-between gap-2">
            {/* LEFT */}
            <div className="flex items-center gap-2 min-w-0">
              {showBackButton && (
                <Button
                  onClick={closeActive}
                  className="p-1.5 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100/80 border border-gray-200/50 hover:from-gray-100 hover:to-gray-200 transition-all group shadow-sm hover:shadow-md"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
                </Button>
              )}

              {selectedChat ? (
                <div className="relative shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md ${selectedChat.avatarColor}`}
                  // style={{
                  //   backgroundImage: selectedChat.avatarColor.includes(
                  //     "gradient",
                  //   )
                  //     ? selectedChat.avatarColor
                  //     : `linear-gradient(135deg, ${selectedChat.avatarColor}, ${selectedChat.avatarColor}99)`,
                  // }}
                  >
                    <span className="text-base font-bold tracking-wide">
                      {initials(selectedChat.name)}
                    </span>
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-3 border-white shadow-md ${getStatusColor(
                      selectedChat.status,
                    )}`}
                  />
                </div>
              ) : (
                <div className="relative w-10 h-10 rounded-full bg-[#3586FF] flex items-center justify-center shrink-0 shadow-md">
                  <Users className="w-5 h-5 text-white" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-200">
                    <span className="text-[9px] font-bold text-[#3586FF]">
                      {selectedChannel?.memberCount ?? 0}
                    </span>
                  </div>
                </div>
              )}

              <div className="min-w-0">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 truncate">
                  {activeTitle}
                </h2>
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  {selectedChat ? (
                    <>
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${getStatusColor(
                          selectedChat.status,
                        )}`}
                      />
                      <span>
                        {getStatusText(selectedChat.status)}
                      </span>
                    </>
                  ) : selectedChannel ? (
                    <>
                      <Users className="w-3 h-3" />
                      <span>{memberCount} members</span>
                    </>
                  ) : null}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  const currentIndex = themes.findIndex(
                    (t) => t.id === themeId,
                  );
                  const nextIndex =
                    currentIndex >= 0
                      ? (currentIndex + 1) % themes.length
                      : 0;
                  const nextThemeId = themes[nextIndex].id;
                  setThemeId(nextThemeId);
                  onThemeChange?.(nextThemeId);
                }}
                className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur border border-gray-200 text-xs font-semibold tracking-wide text-gray-700 shadow-sm hover:shadow-md hover:border-gray-300 transition flex items-center gap-2"
                aria-label="Change theme"
                title="Change theme"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shadow-sm" />
                <span>{activeTheme.label}</span>
              </Button>

              {isChannel && (
                <Button
                  onClick={openChannelInfo}
                  className="p-2 rounded-full hover:bg-gray-100 transition-all"
                  aria-label="Channel info"
                  title="Channel info"
                >
                  <Info className="w-5 h-5 text-gray-600" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Select a conversation
              </h2>
              <p className="text-xs text-gray-500">
                Choose a conversation from the sidebar to begin messaging
              </p>
            </div>
          </div>
        )}
      </div>

      <div
        className={`flex-1 overflow-y-auto min-h-0 ${activeTheme.chatBg}`}
      >
        {hasActive && (
          <div
            className={`sticky top-0 z-10 py-2 ${activeTheme.bannerBg} backdrop-blur-sm`}
          >
            <div className="flex items-center justify-center">
              <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg shadow-sm mx-auto">
                <span className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-[#3586FF]" />
                  Messages are not private and may be visible to administrators
                </span>
              </div>
            </div>
          </div>
        )}

        {hasActive ? (
          <div className="px-3 md:px-4 py-3 space-y-3 max-w-8xl mx-auto">
            {Object.values(messagesByThread || {})
              .flat()
              .map((m: any) => (
                <div
                  key={m.id}
                  className={`flex ${m.isOwn ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[75%] relative group ${m.isOwn ? "pr-2" : "pl-2"
                      }`}
                  >
                    <div
                      className={`absolute ${m.isOwn
                        ? "left-0 -translate-x-full"
                        : "right-0 translate-x-full"
                        } top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900/90 backdrop-blur-sm rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none`}
                    >
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                    <div
                      className={[
                        "rounded-lg px-3 py-2 shadow-sm min-w-[100px] relative",
                        m.isOwn
                          ? (m.isImportant
                            ? "bg-red-50 text-gray-900"
                            : activeTheme.ownBubble) +
                          " rounded-br-none"
                          : (m.isImportant
                            ? "bg-red-50 text-gray-900"
                            : activeTheme.otherBubble) +
                          " text-gray-900 rounded-bl-none",
                      ].join(" ")}
                    >
                      {/* Important Badge */}
                      {m.isImportant && (
                        <div
                          className={`text-[10px] font-bold uppercase mb-1 flex items-center gap-1 text-red-600`}
                        >
                          <AlertCircle className="w-3 h-3" />
                          Important
                        </div>
                      )}

                      {/* Delete Message Action */}
                      {m.isOwn && onDeleteMessage && (
                        <Button
                          onClick={() => setDeleteMsgId(m.id)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/20"
                          title="Delete message"
                        >
                          <Trash2 className="w-3 h-3 text-white" />
                        </Button>
                      )}

                      {isChannel && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-bold">
                          {m.senderName}
                        </p>
                      )}

                      {!!m.content && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {m.content}
                        </p>
                      )}

                      {!!m.attachments?.length && (
                        <div className="mt-3 space-y-2">
                          {m.attachments.map((a: any) => {
                            const mime = a.mimeType ?? "";
                            const name = a.fileName ?? a.name ?? "Attachment";
                            const size = a.sizeBytes ?? a.size;
                            const kind = a.kind;

                            const isImg = kind === "image" || isImage(mime);
                            const isVid =
                              kind === "video" || mime.startsWith("video/");
                            const isAud =
                              kind === "audio" || mime.startsWith("audio/");
                            const isPdf = mime === "application/pdf";

                            return (
                              <a
                                key={a.id ?? a.url}
                                href={a.url}
                                target="_blank"
                                rel="noreferrer"
                                className={[
                                  "block rounded-xl border overflow-hidden",
                                  m.isOwn
                                    ? "border-white/20 bg-white/10"
                                    : "border-gray-200 bg-white",
                                ].join(" ")}
                              >
                                {isImg ? (
                                  <div className="p-px">
                                    <img
                                      src={a.url}
                                      alt={name}
                                      className="max-h-44 w-full object-cover rounded-lg border-black border"
                                    />
                                    <div
                                      className={[
                                        "mt-2 text-xs flex items-center justify-between",
                                        m.isOwn
                                          ? activeTheme.ownMetaText
                                          : activeTheme.otherMetaText,
                                      ].join(" ")}
                                    >
                                      <span className="ml-2 shrink-0">
                                        {size ? prettyBytes(Number(size)) : ""}
                                      </span>
                                    </div>
                                  </div>
                                ) : isVid ? (
                                  <div className="p-px">
                                    <video
                                      src={a.url}
                                      controls
                                      className="max-h-64 w-full rounded-lg"
                                    />
                                    <div
                                      className={[
                                        "mt-2 text-xs flex items-center justify-between",
                                        m.isOwn
                                          ? activeTheme.ownMetaText
                                          : activeTheme.otherMetaText,
                                      ].join(" ")}
                                    >
                                      <span className="truncate">{name}</span>
                                      <span className="ml-2 shrink-0">
                                        {size ? prettyBytes(Number(size)) : ""}
                                      </span>
                                    </div>
                                  </div>
                                ) : isAud ? (
                                  <div className="p-px space-y-2">
                                    <audio
                                      src={a.url}
                                      controls
                                      className="w-full"
                                    />
                                    <div
                                      className={[
                                        "text-xs flex items-center justify-between",
                                        m.isOwn
                                          ? activeTheme.ownMetaText
                                          : activeTheme.otherMetaText,
                                      ].join(" ")}
                                    >
                                      <span className="truncate">{name}</span>
                                      <span className="ml-2 shrink-0">
                                        {size ? prettyBytes(Number(size)) : ""}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3 p-3">
                                    <div
                                      className={[
                                        "w-9 h-9 rounded-lg flex items-center justify-center",
                                        m.isOwn ? "bg-white/15" : "bg-gray-100",
                                      ].join(" ")}
                                    >
                                      <FileText
                                        className={
                                          m.isOwn
                                            ? "w-5 h-5 text-white"
                                            : "w-5 h-5 text-gray-700"
                                        }
                                      />
                                    </div>

                                    <div className="min-w-0">
                                      <div
                                        className={[
                                          "text-sm font-semibold truncate",
                                          m.isOwn
                                            ? "text-white"
                                            : "text-gray-900",
                                        ].join(" ")}
                                      >
                                        {name}
                                      </div>
                                      <div
                                        className={[
                                          "text-xs",
                                          m.isOwn
                                            ? activeTheme.ownMetaText
                                            : activeTheme.otherMetaText,
                                        ].join(" ")}
                                      >
                                        {isPdf ? "PDF" : mime || "File"}
                                        {size
                                          ? ` • ${prettyBytes(Number(size))}`
                                          : ""}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </a>
                            );
                          })}
                        </div>
                      )}

                      <div
                        className={`flex items-center justify-between mt-3 text-xs ${m.isOwn
                          ? activeTheme.ownMetaText
                          : activeTheme.otherMetaText
                          }`}
                      >
                        <span className="font-medium">{m.timestamp}</span>
                        <div className="flex items-center gap-1">
                          {m.isOwn && (
                            <span className="opacity-90 flex items-center gap-1">
                              <CheckCheck
                                className={`w-4 h-4 ${(() => {
                                  const msgTime = new Date(
                                    m.createdAt || m.timestamp,
                                  ).getTime();
                                  const othersSeen = readReceipts.filter(
                                    (r) =>
                                      r.userId !== currentUserId &&
                                      r.lastReadAt &&
                                      new Date(r.lastReadAt).getTime() >=
                                      msgTime,
                                  );

                                  if (selectedChannel && channelDetails) {
                                    // For channels, everyone else must have seen it
                                    const otherMembersCount =
                                      (channelDetails.members?.length || 1) -
                                      1;
                                    return (
                                      othersSeen.length >=
                                      otherMembersCount &&
                                      otherMembersCount > 0
                                    );
                                  } else {
                                    // For DMs, at least one other person (there's only one anyway)
                                    return othersSeen.length > 0;
                                  }
                                })()
                                  ? "text-blue-300"
                                  : ""
                                  }`}
                              />
                              <span className="text-[10px]">
                                {(() => {
                                  const msgTime = new Date(
                                    m.createdAt || m.timestamp,
                                  ).getTime();
                                  const othersSeen = readReceipts.filter(
                                    (r) =>
                                      r.userId !== currentUserId &&
                                      r.lastReadAt &&
                                      new Date(r.lastReadAt).getTime() >=
                                      msgTime,
                                  );

                                  if (selectedChannel && channelDetails) {
                                    const otherMembersCount =
                                      (channelDetails.members?.length || 1) - 1;
                                    return (
                                      othersSeen.length >= otherMembersCount &&
                                      otherMembersCount > 0
                                    );
                                  } else {
                                    return othersSeen.length > 0;
                                  }
                                })()
                                  ? "Seen"
                                  : "Delivered"}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center px-4">
            <div className="mx-auto w-full max-w-md text-center px-6 py-12 flex flex-col items-center">
              <div className="relative mx-auto w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6 shadow-lg border border-blue-100">
                <MessageSquare className="w-10 h-10 text-[#3586FF]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Welcome to Chat
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Pick a conversation from the sidebar to start chatting with your
                team. Create channels for projects or message colleagues
                directly.
              </p>
            </div>
          </div>
        )}
      </div>

      {hasActive && (
        <div className="border-gray-200/50 backdrop-blur-sm px-3 py-1.5 shadow-[0_-4px_20px_-6px_rgba(0,0,0,0.05)]">
          {(attachments.length > 0 || uploading) && (
            <div className="mb-2">
              <div className="flex flex-wrap items-center gap-2">
                {attachments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-gray-200 bg-white shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5 text-gray-600" />
                    <div className="text-xs font-semibold text-gray-800 max-w-[200px] truncate">
                      {a.name}
                      {a.size ? (
                        <span className="ml-1.5 text-[10px] text-gray-500 font-medium">
                          {prettyBytes(a.size)}
                        </span>
                      ) : null}
                    </div>
                    <Button
                      onClick={() => removeAttachment(a.id)}
                      className="p-0.5 rounded-lg hover:bg-gray-100"
                      aria-label="Remove attachment"
                    >
                      <X className="w-3 h-3 text-gray-500" />
                    </Button>
                  </div>
                ))}

                {uploading && (
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50">
                    <div className="text-xs font-semibold text-blue-800">
                      Uploading… {uploadProgress}%
                    </div>
                    <div className="w-24 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                      <div
                        className="h-1.5 bg-blue-600"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative flex items-center gap-2 shrink-0">
              <IconBtn
                label={uploading ? `Uploading ${uploadProgress}%` : "Attach"}
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className={`p-2.5 rounded-full hover:bg-gray-100 text-gray-600 transition-all ${uploading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
              >
                <Paperclip className="w-5 h-5" />
              </IconBtn>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                onChange={onFilesSelected}
              />

              {showAttachMenu && (
                <div className="absolute bottom-12 left-0 z-50 w-52 rounded-lg border border-gray-200 bg-white shadow-2xl p-1">
                  <Button
                    onClick={onPickFile}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Upload className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-800">
                        Upload from this device
                      </div>
                    </div>
                  </Button>
                </div>
              )}

              <div className="relative" ref={emojiWrapRef}>
                <IconBtn
                  label="Emoji"
                  onClick={() => setShowEmoji((v: boolean) => !v)}
                  className="p-2.5 rounded-full hover:bg-gray-100 text-gray-600 transition-all"
                >
                  <Smile className="w-5 h-5" />
                </IconBtn>

                {showEmoji && (
                  <div className="absolute bottom-12 left-0 z-50 shadow-2xl rounded-xl overflow-hidden border border-gray-100 bg-white">
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      height={320}
                      width={320}
                      previewConfig={{ showPreview: false }}
                      skinTonesDisabled
                      searchDisabled={false}
                      lazyLoadEmojis
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 relative basis-full order-3 sm:basis-auto sm:order-none">
              <TextInput
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder={
                  uploading ? "Uploading file…" : "Type a message"
                }
                disabled={uploading}
                containerClassName="relative w-full bg-white border border-gray-300 rounded-full hover:border-gray-400 transition-all"
                inputClassName="px-4  text-sm text-gray-900 placeholder-gray-500 disabled:opacity-60"
                rightIcon={
                  isChannel ? (
                    <button
                      type="button"
                      onClick={() => setIsImportant((prev) => !prev)}
                      className={`p-1.5 rounded-full transition-all ${isImportant
                        ? "bg-red-100 text-red-600"
                        : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                        }`}
                      title="Mark as Important"
                    >
                      <AlertCircle
                        className="w-4 h-4"
                        fill={isImportant ? "currentColor" : "none"}
                      />
                    </button>
                  ) : undefined
                }
              />
            </div>

            <Button
              onClick={() => {
                onSend();
                setShowEmoji(false);
              }}
              disabled={
                uploading || (!newMessage.trim() && attachments.length === 0)
              }
              className={[
                "p-2.5 rounded-full transition-all duration-200 flex items-center justify-center shrink-0",
                !uploading && (newMessage.trim() || attachments.length > 0)
                  ? (isImportant
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-[#3586FF] hover:bg-[#2970E5]") +
                  " shadow-md hover:shadow-lg"
                  : "bg-gray-300 cursor-not-allowed",
              ].join(" ")}
              aria-label="Send"
            >
              <Send className="w-5 h-5 text-white" />
            </Button>
          </div>
        </div>
      )}

      {/* ===================== CHANNEL INFO MODAL ===================== */}
      {selectedChannel && isChannelInfoOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeChannelInfo}
            aria-label="Close modal"
          />

          <div className="relative z-10 w-[92%] max-w-2xl rounded-xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {!isEditingTitle ? (
                    <>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-10 h-10 rounded-full bg-[#3586FF] flex items-center justify-center shadow-md">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold text-gray-900 truncate">
                            {channelDetails?.title ??
                              selectedChannel.name ??
                              "Channel"}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-xs text-gray-600">
                              {memberCount}{" "}
                              {memberCount === 1 ? "member" : "members"}
                            </p>
                            {isAdmin && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description Display */}
                      {(channelDetails as any)?.description?.trim() ? (
                        <div className="mt-3 rounded-lg border border-gray-200 bg-white/80 backdrop-blur-sm p-2.5">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                            About this channel
                          </div>
                          <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {(channelDetails as any)?.description}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-2.5 text-center">
                          <p className="text-xs text-gray-500 italic">
                            No description added yet
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3">
                      <Field label="Channel name" required>
                        <TextInput
                          value={titleDraft}
                          onChange={(e) => setTitleDraft(e.target.value)}
                          maxLength={100}
                          placeholder="Channel title"
                        />
                      </Field>

                      <Field
                        label="Description"
                        hint={`${descDraft.length}/500`}
                        labelClassName="flex items-center justify-between"
                      >
                        <Textarea
                          value={descDraft}
                          onChange={(e) => setDescDraft(e.target.value)}
                          rows={4}
                          maxLength={500}
                          placeholder="What's this channel about?"
                          textareaClassName="resize-none"
                        />
                      </Field>

                      <div className="flex gap-2 pt-1">
                        <Button
                          onClick={async () => {
                            const threadId = selectedChannel.id;

                            try {
                              if (onEditChannelTitle) {
                                await onEditChannelTitle(threadId, titleDraft);
                              }
                              if (onEditChannelDescription) {
                                await onEditChannelDescription(
                                  threadId,
                                  descDraft.trim(),
                                );
                              }
                              toast.success("Channel updated");
                              setIsEditingTitle(false);
                            } catch (e: any) {
                              console.error(e);
                              toast.error(
                                e?.message ?? "Failed to update channel",
                              );
                            }
                          }}
                          className="px-4 md:py-2 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg transition-all"
                        >
                          Save changes
                        </Button>

                        <Button
                          onClick={() => {
                            setIsEditingTitle(false);
                            setTitleDraft(
                              channelDetails?.title ??
                              selectedChannel?.name ??
                              "",
                            );
                            setDescDraft(
                              (channelDetails as any)?.description ?? "",
                            );
                          }}
                          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-50 transition-all"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={closeChannelInfo}
                  className="p-1.5 rounded-lg hover:bg-white/80 transition-all"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </Button>
              </div>
            </div>

            {/* Members Section */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                  Members ({memberCount})
                </h4>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1.5 rounded-lg border border-gray-200 bg-gray-50/30 p-1.5">
                {(channelDetails?.members ?? []).map((m) => {
                  const isOwner = m.role === "owner";
                  const isMe = m.userId === currentUserId;
                  return (
                    <div
                      key={m.userId}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-gray-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {m.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-semibold text-gray-900 truncate">
                              {m.name}
                            </p>
                            {isMe && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                                You
                              </span>
                            )}
                            {isOwner && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                                Owner
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 capitalize">
                            {m.role ?? "member"}
                          </p>
                        </div>
                      </div>

                      {isAdmin &&
                        !isOwner &&
                        m.userId !== currentUserId &&
                        onRemoveMember && (
                          <Button
                            onClick={() =>
                              onRemoveMember(selectedChannel.id, m.userId)
                            }
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-all shrink-0"
                          >
                            Remove
                          </Button>
                        )}
                    </div>
                  );
                })}

                {!channelDetails?.members?.length && (
                  <div className="px-3 py-6 text-xs text-gray-500 text-center">
                    Members not loaded yet.
                  </div>
                )}
              </div>
            </div>

            {/* Actions Section */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/50">
              <div className="flex flex-wrap gap-1.5">
                {isAdmin && (
                  <>
                    {onAddMembers && (
                      <Button
                        onClick={() => {
                          setShowAddMembers(true);
                          setDescDraft(
                            ((channelDetails as any)?.description ?? "").trim(),
                          );
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold hover:shadow-lg transition-all"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Add members
                      </Button>
                    )}

                    {!isEditingTitle && (
                      <Button
                        onClick={() => {
                          setIsEditingTitle(true);
                          setTitleDraft(
                            channelDetails?.title ??
                            selectedChannel?.name ??
                            "",
                          );
                          setDescDraft(
                            (channelDetails as any)?.description ?? "",
                          );
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold hover:bg-white transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit channel
                      </Button>
                    )}

                    {onDeleteChannel && (
                      <Button
                        onClick={() => onDeleteChannel(selectedChannel.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-300 text-xs font-semibold text-red-700 hover:bg-red-50 hover:border-red-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete channel
                      </Button>
                    )}
                  </>
                )}

                {onClearChat && (!isChannel || isAdmin) && (
                  <Button
                    onClick={() => {
                      setShowClearConfirm(true);
                      setIsChannelInfoOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-300 text-xs font-semibold text-orange-700 hover:bg-orange-50 hover:border-orange-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear chat
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddMembers && selectedChannel && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-3">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Add members
                </h3>
                <p className="text-xs text-gray-500">
                  Select users to add to{" "}
                  <span className="font-semibold">{selectedChannel.name}</span>
                </p>
              </div>
              <Button
                onClick={() => setShowAddMembers(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-700" />
              </Button>
            </div>

            <div className="px-4 py-3 space-y-3">
              {/* ✅ NEW: edit description inside Add Members modal */}
              {isAdmin && onEditChannelDescription && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-2.5">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="text-xs font-semibold text-gray-700">
                      Channel description
                    </div>
                    <Button
                      onClick={saveDescription}
                      disabled={savingDesc}
                      className={[
                        "px-2.5 py-1 rounded-lg text-xs font-semibold",
                        savingDesc
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700",
                      ].join(" ")}
                    >
                      {savingDesc ? "Saving..." : "Save description"}
                    </Button>
                  </div>

                  <Textarea
                    value={descDraft}
                    onChange={(e) => setDescDraft(e.target.value)}
                    rows={3}
                    placeholder="Write a short channel description..."
                    textareaClassName="resize-none"
                    containerClassName="bg-white"
                  />
                </div>
              )}

              <div className="relative">
                <TextInput
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search users..."
                  leftIcon={<Search className="w-4 h-4 text-gray-500" />}
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1.5">
                {addableUsers.length === 0 ? (
                  <div className="text-sm text-gray-500 py-4 text-center">
                    No users available to add.
                  </div>
                ) : (
                  addableUsers.map((u: any) => {
                    const checked = selectedIds.includes(u.id);
                    return (
                      <Button
                        key={u.id}
                        onClick={() => toggleSelect(u.id)}
                        className={[
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition",
                          checked
                            ? "border-blue-300 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50",
                        ].join(" ")}
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {u.name}
                          </div>
                          {u.email && (
                            <div className="text-xs text-gray-500 truncate">
                              {u.email}
                            </div>
                          )}
                        </div>

                        <div
                          className={[
                            "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                            checked
                              ? "bg-blue-600 border-blue-600"
                              : "bg-white border-gray-300",
                          ].join(" ")}
                        >
                          {checked && (
                            <span className="text-white text-xs font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                      </Button>
                    );
                  })
                )}
              </div>

              <div className="text-xs text-gray-600">
                Selected:{" "}
                <span className="font-semibold">{selectedIds.length}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t">
              <Button
                onClick={() => setShowAddMembers(false)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={submitAddMembers}
                disabled={!selectedIds.length || savingMembers}
                className={[
                  "px-3 py-1.5 rounded-lg text-sm font-semibold text-white",
                  !selectedIds.length || savingMembers
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#3586FF] hover:bg-[#2970E5]",
                ].join(" ")}
              >
                {savingMembers ? "Adding..." : "Add selected"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* CONFIRM DELETE MESSAGE MODAL */}
      <Modal
        isOpen={!!deleteMsgId}
        closeModal={() => setDeleteMsgId(null)}
        title="Delete Message"
        titleCls="text-center"
        isCloseRequired={false}
      >
        <p className="label-text text-center sublabel-text">
          Are you sure you want to delete this message? This action cannot be
          undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          {/* Secondary Action */}
          <Button
            onClick={() => setDeleteMsgId(null)}
            className="bg-gray-100 text-gray-800 hover:bg-gray-200"
          >
            Cancel
          </Button>

          {/* Primary Action */}
          <Button
            onClick={() => {
              if (deleteMsgId && onDeleteMessage) {
                onDeleteMessage(deleteMsgId);
              }
              setDeleteMsgId(null);
            }}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </Button>
        </div>
      </Modal>

      {/* CONFIRM CLEAR CHAT MODAL */}
      <Modal
        isOpen={showClearConfirm}
        closeModal={() => setShowClearConfirm(false)}
        title="Clear Chat History"
        isCloseRequired={false}
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to clear all messages in this conversation? This
          will delete the entire history for YOU.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          {/* Secondary Action */}
          <Button
            onClick={() => setShowClearConfirm(false)}
            className="bg-gray-100 text-gray-800 hover:bg-gray-200"
          >
            Cancel
          </Button>

          {/* Primary Action */}
          <Button
            onClick={() => {
              if (onClearChat) {
                onClearChat();
              }
              setShowClearConfirm(false);
            }}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Clear All
          </Button>
        </div>
      </Modal>
    </div>
  );
}
