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
  X,
  FileText,
  Upload,
} from "lucide-react";

import {
  getStatusColor,
  getStatusText,
  IconBtn,
  initials,
} from "@/utils/chat/utilFunctions";
import { ChatUser, MessagesByThread } from "@/utils/chat/types";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import Button from "@/common/Button";
import { uploadFile } from "@/utils/uploadFile";
import Link from "next/link";

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
  activeTitle,
  closeActive,
  messagesByThread,
  messagesEndRef,
  newMessage,
  setNewMessage,
  handleKeyDown,
  handleSendMessage,
  showBackButton = false,
  currentUserId,
  readReceipts = [],
  threadTheme,
  onThemeChange,
}: {
  selectedChat: ChatUser | null;
  activeTitle: string;
  closeActive: () => void;
  messagesByThread: MessagesByThread | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSendMessage: (...args: any[]) => void;
  showBackButton?: boolean;
  currentUserId?: string;
  readReceipts?: any[];
  threadTheme?: string | null;
  onThemeChange?: (themeId: string) => void;
}) {
  const hasActive = Boolean(selectedChat);
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
    },
    {
      id: "mint",
      label: "Mint",
      pageBg: "bg-gradient-to-b from-emerald-50 via-teal-50 to-cyan-50",
      chatBg: "bg-emerald-50/70",
      ownBubble: "bg-emerald-600 text-white",
      otherBubble: "bg-white text-emerald-900",
      ownMetaText: "text-emerald-100/90",
      otherMetaText: "text-emerald-700",
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

  const [showEmoji, setShowEmoji] = useState(false);
  const emojiWrapRef = useRef<HTMLDivElement | null>(null);

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const threadKey = useMemo(() => {
    if (!selectedChat) return null;
    if ((selectedChat as any).threadId)
      return `dm:${(selectedChat as any).threadId}`;
    return null;
  }, [selectedChat]);

  const currentThreadMessages = useMemo(() => {
    if (!threadKey || !messagesByThread) return [];
    return messagesByThread[threadKey] ?? [];
  }, [threadKey, messagesByThread]);

  const onPickFile = () => {
    setShowAttachMenu(false);
    fileInputRef.current?.click();
  };

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowEmoji(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setAttachments([]);
    setUploadProgress(0);
    setUploading(false);
    setShowEmoji(false);
  }, [threadKey]);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(`${newMessage ?? ""}${emojiData.emoji ?? ""}`);
  };

  const onFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";

    if (!files.length) return;

    const MAX_FILES = 5;
    if (attachments.length + files.length > MAX_FILES) {
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        setUploadProgress(0);

        const url = await uploadFile(f, "chatsattachments", "chatattachments", undefined, (p) =>
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
        dmThreadId: (selectedChat as any)?.threadId,
      });
    } catch {
      handleSendMessage();
    }

    setNewMessage("");
    setAttachments([]);
    setShowEmoji(false);
  };

  return (
    <div
      className={`flex-1 min-w-0 flex flex-col w-full fixed h-screen overflow-hidden ${activeTheme.pageBg}`}
    >
      <div className="bg-white/90 backdrop-blur-sm px-3 py-2.5 shadow-sm">
        {hasActive ? (
          <div className="flex items-center justify-between gap-2">
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
                      <span>{getStatusText(selectedChat.status)}</span>
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
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Select a conversation
              </h2>
              <p className="text-xs text-gray-500">
                Choose a conversation to begin messaging
              </p>
            </div>
          </div>
        )}
      </div>

      <div
        className={`flex-1 overflow-y-auto min-h-0 ${activeTheme.chatBg}`}
      >
        {hasActive ? (
          <div className="px-3 md:px-4 py-3 space-y-3 max-w-8xl mx-auto">
            {currentThreadMessages.map((m: any) => (
                <div
                  key={m.id}
                  className={`flex ${m.isOwn ? "justify-end" : "justify-start"}`}
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
                      {m.isImportant && (
                        <div className="text-[10px] font-bold uppercase mb-1 flex items-center gap-1 text-red-600">
                          <AlertCircle className="w-3 h-3" />
                          Important
                        </div>
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
                              <Link
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
                              </Link>
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
                                  return othersSeen.length > 0;
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
                                  return othersSeen.length > 0
                                    ? "Seen"
                                    : "Delivered";
                                })()}
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
                Pick a conversation to start chatting.
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

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
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
                  <div className="absolute bottom-12 left-0 z-50 shadow-2xl rounded-xl overflow-hidden border border-gray-200 bg-white">
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

            <div className="flex-1 min-w-0 relative">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={uploading ? "Uploading file…" : "Type a message"}
                disabled={uploading}
                className="relative w-full bg-white border border-gray-300 rounded-full hover:border-gray-400 transition-all px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 disabled:opacity-60"
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
                "p-2.5 rounded-full transition-all duration-200 flex items-center justify-center",
                !uploading && (newMessage.trim() || attachments.length > 0)
                  ? "bg-[#3586FF] hover:bg-[#2970E5] shadow-md hover:shadow-lg"
                  : "bg-gray-300 cursor-not-allowed",
              ].join(" ")}
              aria-label="Send"
            >
              <Send className="w-5 h-5 text-white" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
