// Chatbot.tsx
import { useState, useEffect, useRef, FormEvent, useCallback } from "react";
import { IoMdClose } from "react-icons/io";
import { FiSend, FiMinimize2, FiMaximize2, FiUser, FiChevronDown, FiPlusCircle, FiTrash2 } from "react-icons/fi";
import { MdHistory } from "react-icons/md";
import { RiRobot2Line } from "react-icons/ri";
import { useChat, Message } from "ai/react";
import Image from "next/image";
import Button from "../Button";
import Markdown from "react-markdown";
import toast from "react-hot-toast";
import apiClient from "@/utils/apiClient";
import Link from "next/link";

const STORAGE_KEY_SESSION = "onecasa_chat_session_id_v1";
const STORAGE_KEY_ACTIVE = "onecasa_chat_active_id_v1";
const STORAGE_KEY_MESSAGES = "onecasa_chat_messages_v2";

function generateClientConversationId() {
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Session id for anonymous (not-logged-in) users. Persisted in localStorage when possible.
 * When localStorage is unavailable, returns a per-tab fallback so we never send empty sessionId
 * (which would mix conversations across users). Logged-in users are identified by JWT; backend
 * uses sessionId only when there is no user.
 */
function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let sid = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!sid) {
      sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(STORAGE_KEY_SESSION, sid);
    }
    return sid;
  } catch {
    return `anon_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}

function isBackendConversationId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// more permissive HTML check so tags don't show as text
const looksLikeHTML = (txt: string) => {
  if (typeof txt !== "string") return false;
  const t = txt.trim().toLowerCase();
  if (t.startsWith("<")) return true;
  return ["<p", "<div", "<h1", "<h2", "<h3", "<ul", "<ol", "<li", "<span", "<Link", "<br", "<hr"].some(tag => t.includes(tag));
};

const SUGGESTIONS = [
  "Show 2BHK flats to buy in Madhapur Hyderabad",
  "What is interiors Service? Tell me in short",
  "Give Vastu tips for a 2BHK flat",
  "Properties for rent in Bangalore",
  "What services does Onecasa provide?",
  "Painting cost estimate for 3BHK",
  "What’s the difference between carpet, built-up & super area?",
];

export type ConversationListItem = { id: string; title: string; createdAt: string };

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [scrolledUp, setScrolledUp] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [conversationList, setConversationList] = useState<ConversationListItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFetchError, setHistoryFetchError] = useState(false);
  const [conversationId, setConversationId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(STORAGE_KEY_ACTIVE) || "";
  });
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const lastSyncedCountRef = useRef(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    setMessages,
    reload,
    append,
  } = useChat({
    id: `onecasa-chat-${conversationId || "new"}`,
    api: "/api/chat",
    initialInput: "",
    keepLastMessageOnError: true,
    onError: (err) => {
      toast.error(err?.message || "Something went wrong. Please try again.");
    },
  });

  const sessionIdRef = useRef("");
  const getSessionId = useCallback(() => {
    if (!sessionIdRef.current) sessionIdRef.current = getOrCreateSessionId();
    return sessionIdRef.current;
  }, []);

  const chatBase = apiClient.URLS.chatbotConversations;

  const createConversation = useCallback(async (): Promise<string> => {
    const sid = getSessionId();
    const { body } = await apiClient.post(chatBase, { sessionId: sid }, true);
    const id = (body as { id?: string })?.id;
    if (id) {
      try {
        localStorage.setItem(STORAGE_KEY_ACTIVE, id);
      } catch { }
      return id;
    }
    throw new Error("Failed to create conversation");
  }, [getSessionId, chatBase]);

  const loadMessagesFromBackend = useCallback(
    async (convId: string) => {
      const sid = getSessionId();
      try {
        const { body } = await apiClient.get(
          `${chatBase}/${convId}/messages?sessionId=${encodeURIComponent(sid)}`,
          {},
          true
        );
        const list = (body as { id: string; role: string; content: string }[]) ?? [];
        const msgs: Message[] = list.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        }));
        if (msgs.length > 0) {
          setMessages(msgs);
          lastSyncedCountRef.current = msgs.length;
        }
      } catch {
        setMessages([]);
      }
    },
    [getSessionId, chatBase, setMessages]
  );

  useEffect(() => {
    if (historyLoaded) return;
    if (conversationId && isBackendConversationId(conversationId)) {
      loadMessagesFromBackend(conversationId).finally(() => setHistoryLoaded(true));
      return;
    }
    if (conversationId && !isBackendConversationId(conversationId)) {
      try {
        const key = `${STORAGE_KEY_MESSAGES}_${conversationId}`;
        const raw = localStorage.getItem(key);
        if (raw) {
          const prev: Message[] = JSON.parse(raw);
          if (Array.isArray(prev) && prev.length > 0) setMessages(prev);
        }
      } catch { }
      setHistoryLoaded(true);
      return;
    }
    createConversation()
      .then((id) => {
        setConversationId(id);
        setHistoryLoaded(true);
      })
      .catch(() => {
        const fallbackId = generateClientConversationId();
        setConversationId(fallbackId);
        try {
          localStorage.setItem(STORAGE_KEY_ACTIVE, fallbackId);
        } catch { }
        setHistoryLoaded(true);
      });
  }, [conversationId, historyLoaded, createConversation, loadMessagesFromBackend, setMessages]);

  const syncingRef = useRef(false);
  useEffect(() => {
    if (!conversationId || !isBackendConversationId(conversationId)) return;
    const list = messages ?? [];
    if (list.length <= lastSyncedCountRef.current) return;
    if (list[list.length - 1]?.role !== "assistant") return;
    if (syncingRef.current) return;
    syncingRef.current = true;
    const toSync = list.slice(lastSyncedCountRef.current);
    const sid = getSessionId();
    apiClient
      .post(
        `${chatBase}/${conversationId}/messages?sessionId=${encodeURIComponent(sid)}`,
        { messages: toSync.map((m) => ({ role: m.role, content: m.content })) },
        true
      )
      .then(() => {
        lastSyncedCountRef.current = list.length;
      })
      .catch(() => {})
      .finally(() => {
        syncingRef.current = false;
      });
  }, [messages, conversationId, getSessionId, chatBase]);

  useEffect(() => {
    if (!conversationId || isBackendConversationId(conversationId)) return;
    try {
      const key = `${STORAGE_KEY_MESSAGES}_${conversationId}`;
      localStorage.setItem(key, JSON.stringify(messages ?? []));
    } catch { }
  }, [messages, conversationId]);

  const startNewConversation = useCallback(async () => {
    setShowHistoryPanel(false);
    try {
      const id = await createConversation();
      setConversationId(id);
      setMessages([]);
      lastSyncedCountRef.current = 0;
      toast.success("New conversation started");
    } catch {
      const fallbackId = generateClientConversationId();
      setConversationId(fallbackId);
      setMessages([]);
      lastSyncedCountRef.current = 0;
      try {
        localStorage.setItem(STORAGE_KEY_ACTIVE, fallbackId);
      } catch { }
      toast.success("New conversation started");
    }
  }, [createConversation, setMessages]);

  const fetchHistoryList = useCallback(async () => {
    const sid = getSessionId();
    setHistoryLoading(true);
    setHistoryFetchError(false);
    try {
      const { body } = await apiClient.get(
        `${chatBase}?sessionId=${encodeURIComponent(sid)}`,
        {},
        true
      );
      const list = (body as { id: string; title?: string; createdAt: string }[]) ?? [];
      const mapped = list.map((c) => ({
        id: c.id,
        title: c.title ?? "New chat",
        createdAt: c.createdAt,
      }));
      // Ensure current conversation appears in list (e.g. just created or backend list was empty)
      if (conversationId && isBackendConversationId(conversationId) && !mapped.some((c) => c.id === conversationId)) {
        const firstUser = messages?.find((m) => m.role === "user");
        const title = firstUser?.content?.trim()?.slice(0, 40) || "New chat";
        setConversationList([
          { id: conversationId, title: title + (firstUser && firstUser.content.length > 40 ? "…" : ""), createdAt: new Date().toISOString() },
          ...mapped,
        ]);
      } else {
        setConversationList(mapped);
      }
    } catch {
      setConversationList([]);
      setHistoryFetchError(true);
      toast.error("Couldn't load chat history. Is the backend running?");
    } finally {
      setHistoryLoading(false);
    }
  }, [getSessionId, chatBase, conversationId, messages]);

  const loadConversation = useCallback((convId: string) => {
    setConversationId(convId);
    setHistoryLoaded(false);
    setShowHistoryPanel(false);
  }, []);

  const deleteOneHistory = useCallback(
    async (convId: string) => {
      const sid = getSessionId();
      if (!isBackendConversationId(convId)) return;
      try {
        await apiClient.delete(
          `${chatBase}/${convId}?sessionId=${encodeURIComponent(sid)}`,
          {},
          true
        );
      } catch {
        toast.error("Failed to remove chat");
        return;
      }
      setConversationList((prev) => prev.filter((c) => c.id !== convId));
      if (convId === conversationId) {
        try {
          const id = await createConversation();
          setConversationId(id);
          setMessages([]);
          lastSyncedCountRef.current = 0;
          setHistoryLoaded(true);
        } catch {
          const fallbackId = generateClientConversationId();
          setConversationId(fallbackId);
          setMessages([]);
          lastSyncedCountRef.current = 0;
          setHistoryLoaded(true);
          try {
            localStorage.setItem(STORAGE_KEY_ACTIVE, fallbackId);
          } catch {}
        }
        setShowHistoryPanel(false);
      }
      toast.success("Chat removed from history");
    },
    [conversationId, getSessionId, chatBase, createConversation]
  );

  useEffect(() => {
    if (showHistoryPanel) fetchHistoryList();
  }, [showHistoryPanel, fetchHistoryList]);

  const deleteCurrentHistory = useCallback(async () => {
    if (!conversationId || !isBackendConversationId(conversationId)) {
      try {
        if (conversationId) {
          localStorage.removeItem(`${STORAGE_KEY_MESSAGES}_${conversationId}`);
        }
      } catch { }
      const fallbackId = generateClientConversationId();
      setConversationId(fallbackId);
      setMessages([]);
      lastSyncedCountRef.current = 0;
      try {
        localStorage.setItem(STORAGE_KEY_ACTIVE, fallbackId);
      } catch { }
      toast.success("Chat history cleared");
      return;
    }
    const sid = getSessionId();
    try {
      await apiClient.delete(
        `${chatBase}/${conversationId}?sessionId=${encodeURIComponent(sid)}`,
        {},
        true
      );
      const id = await createConversation();
      setConversationId(id);
      setMessages([]);
      lastSyncedCountRef.current = 0;
      toast.success("Chat history cleared");
    } catch {
      const fallbackId = generateClientConversationId();
      setConversationId(fallbackId);
      setMessages([]);
      lastSyncedCountRef.current = 0;
      try {
        localStorage.setItem(STORAGE_KEY_ACTIVE, fallbackId);
      } catch { }
      toast.success("Chat history cleared");
    }
  }, [conversationId, getSessionId, chatBase, createConversation, setMessages]);

  // scroll handling
  useEffect(() => {
    if (!scrolledUp) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, scrolledUp]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
      setScrolledUp(!nearBottom);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // focus on open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [isOpen, isMinimized]);

  const toggleMinimize = () => setIsMinimized((v) => !v);
  const onOpen = () => setIsOpen(true);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!navigator.onLine) return toast.error("You’re offline. Please check your connection.");
    if (isLoading) return;
    handleSubmit(e);
  };

  const onSuggestion = async (text: string) => {
    if (isLoading) return;
    await append({ role: "user", content: text });
  };

  const getLinkLabel = (url: string): string => {
    const u = url.toLowerCase();
    if (u.includes("/properties/")) return "View properties";
    if (u.includes("/services/furnitures") || u.includes("/furnitures-shop")) return "Browse furniture";
    if (u.includes("/services/electronics") || u.includes("/electronics-shop")) return "Browse electronics";
    if (u.includes("/painting/")) return "Painting cost estimator";
    if (u.includes("/interiors/")) return "Interiors cost estimator";
    if (u.includes("/solar")) return "Solar calculator";
    if (u.includes("vaastu")) return "Vaastu consultation";
    return "Open link";
  };

  const isCtaLink = (url: string): boolean =>
    /\/properties\//i.test(url) ||
    /\/services\/furnitures|\/furnitures-shop/i.test(url) ||
    /\/services\/electronics|\/electronics-shop/i.test(url) ||
    /\/painting\//i.test(url) ||
    /\/interiors\//i.test(url) ||
    /\/solar/i.test(url) ||
    /vaastu/i.test(url);

  const extractUrls = (text: string) => {
    const urlPattern = /https?:\/\/[^\s/$.?#].[^\s]*/gi;
    const urls = text.match(urlPattern) || [];
    const ctaUrls = urls.filter((u) => isCtaLink(u));
    const otherUrls = urls.filter((u) => !isCtaLink(u));
    const remainingText = text.replace(urlPattern, "").trim();
    return (
      <>
        {remainingText && <Markdown>{remainingText}</Markdown>}
        {ctaUrls.length > 0 && (
          <div className="mt-2 flex flex-col gap-1.5">
            {ctaUrls.map((url, i) => (
              <Link
                key={i}
                href={url.startsWith("http") ? url : (typeof window !== "undefined" ? window.location.origin + url : url)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3586FF] px-3 py-2 text-xs font-medium text-white no-underline shadow-sm hover:bg-blue-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {getLinkLabel(url)}
              </Link>
            ))}
          </div>
        )}
        {otherUrls.map((url, i) => (
          <Link
            key={i}
            href={url}
            className="text-[#3586FF] font-regular underline underline-offset-2 mt-1 inline-block"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open link
          </Link>
        ))}
      </>
    );
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onOpen}
        className="fixed md:bottom-10 bottom-[60px] right-4 z-20 bg-[#3586FF] text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-600 animate-bounce"
        aria-label="Open chatbot"
      >
        <RiRobot2Line className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div
      className={`fixed bottom-[50px] right-2 sm:right-4 z-[999] w-[300px] sm:w-96 bg-white rounded-xl shadow-2xl transition-all duration-300 transform ${isMinimized ? "h-16" : "h-[340px] sm:h-[460px]"}`}
    >
      {/* === YOUR ORIGINAL HEADER (kept) === */}
      <div className="bg-gradient-to-r from-[#3586FF] to-blue-700 p-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#212227] backdrop-blur-sm rounded-full flex items-center justify-center">
            <Image src="/images/logobw.png" alt="logo" width={24} height={24} />
          </div>
          <div className="text-white">
            <p className="font-medium label-text text-white">Hi, how can I help you today?</p>
            <div>
              {isLoading ? (
                <div className="flex gap-1 mt-3" aria-live="polite" aria-busy="true">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "200ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "400ms" }} />
                </div>
              ) : (
                <p className="text-[10px] md:text-[12px] font-regular text-blue-100">We respond immediately</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            onClick={startNewConversation}
            className="text-white/80 hover:text-white transition-colors p-1.5"
            aria-label="New conversation"
            title="New conversation"
          >
            <FiPlusCircle className="w-5 h-5" />
          </Button>
          <Button
            onClick={() => setShowHistoryPanel((v) => !v)}
            className="text-white/80 hover:text-white transition-colors p-1.5"
            aria-label="Chat history"
            title="Chat history"
          >
            <MdHistory className="w-5 h-5" />
          </Button>
          <Button
            onClick={toggleMinimize}
            className="text-white/80 hover:text-white transition-colors p-1.5"
            aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
          >
            {isMinimized ? <FiMaximize2 className="w-5 h-5" /> : <FiMinimize2 className="w-5 h-5" />}
          </Button>
          <Button
            onClick={() => { if (isLoading) stop(); setIsOpen(false); }}
            className="text-white/80 hover:text-white transition-colors p-1.5"
            aria-label="Close chat"
          >
            <IoMdClose className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {showHistoryPanel ? (
            <div className="h-[calc(100%-9.5rem)] flex flex-col bg-gray-50 overflow-hidden">
              <div className="p-2 border-b bg-white">
                <p className="text-xs font-medium text-gray-700">Past chats</p>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar p-2">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#3586FF] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-[#3586FF] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-[#3586FF] animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                ) : historyFetchError ? (
                  <div className="py-4 px-2 text-center">
                    <p className="text-xs text-gray-600 mb-2">Couldn&apos;t load chat history.</p>
                    <button
                      type="button"
                      onClick={() => fetchHistoryList()}
                      className="text-xs text-[#3586FF] font-medium underline underline-offset-2 hover:no-underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : conversationList.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center">No past chats yet. Start a conversation to see it here.</p>
                ) : (
                  <ul className="space-y-1">
                    {conversationList.map((conv) => (
                      <li
                        key={conv.id}
                        className="group flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 hover:border-[#3586FF]/40 hover:bg-blue-50/50 transition-colors cursor-pointer"
                        onClick={() => loadConversation(conv.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-regular text-gray-800 truncate">{conv.title}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {new Date(conv.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteOneHistory(conv.id);
                          }}
                          className="shrink-0 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                          aria-label="Delete conversation"
                          title="Delete conversation"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
          <>
          {/* Messages */}
          <div
            ref={viewportRef}
            className="h-[calc(100%-9.5rem)] p-2 overflow-y-auto bg-gray-50 no-scrollbar"
          >
            <div className="flex flex-col gap-4">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 items-end ${isUser ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${isUser ? "bg-blue-100" : "bg-gray-100"}`}
                    >
                      {isUser ? (
                        <FiUser className="w-4 h-4 text-[#3586FF]" />
                      ) : (
                        <div className="w-[30px] h-[30px] bg-[#212227] backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Image src="/images/logobw.png" alt="logo" width={24} height={24} />
                        </div>
                      )}
                    </div>
                    <div
                      className={`relative px-4 py-2 rounded-2xl font-regular text-[12px] max-w-[75%] shadow-sm ${isUser ? "bg-[#3586FF] text-white rounded-br-none" : "bg-white rounded-bl-none"
                        }`}
                    >
                      {/* tiny triangle tail */}
                      <span
                        className={`absolute w-3 h-3 bottom-0 translate-y-1 rotate-45 ${isUser ? "right-0 bg-[#3586FF]" : "left-0 bg-white"
                          }`}
                      />
                      {!isUser && looksLikeHTML(msg.content) ? (
                        <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.content }} />
                      ) : (
                        extractUrls(msg.content)
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Scroll to bottom pill */}
            {scrolledUp && (
              <button
                onClick={() => {
                  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                  setScrolledUp(false);
                }}
                className="absolute right-4 bottom-24 flex items-center gap-1 text-[11px] bg-white border border-black/10 shadow px-2.5 py-1.5 rounded-full"
              >
                <FiChevronDown className="w-4 h-4" />
                New messages
              </button>
            )}
          </div>

          {/* Suggestions + Input */}
          <div className="p-3 bg-white border-t">
            {/* suggestion chips (subtle, no heavy slider) */}
            <div className="flex gap-2 mb-2 overflow-x-auto custom-scrollbar">
              {SUGGESTIONS.slice(0, 4).map((s, i) => (
                <button
                  key={i}
                  onClick={() => onSuggestion(s)}
                  className="text-[11px] whitespace-nowrap px-3 py-[2px] rounded-full bg-gray-50 border border-gray-200 hover:border-blue-400 hover:text-blue-600 transition"
                >
                  {s}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit}>
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask about properties, Vastu, interiors, painting…"
                  className="flex-1 px-4 py-1 bg-gray-50 rounded-[10px] text-[12px] font-regular focus:outline-none focus:ring-2 focus:ring-[#3586FF] focus:bg-white transition-all border border-gray-200"
                />
                <Button
                  disabled={!input.trim() || isLoading}
                  className="bg-[#3586FF] text-white p-2 rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                  type="submit"
                  aria-label="Send message"
                >
                  <FiSend className="w-4 h-4" />
                </Button>
              </div>
              {error && (
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-red-500">{error.message || "Failed to send. Please try again."}</p>
                  <button
                    type="button"
                    onClick={() => reload()}
                    className="text-xs text-[#3586FF] underline underline-offset-2"
                  >
                    Retry
                  </button>
                </div>
              )}
            </form>
          </div>
          </>
          )}
        </>
      )}
    </div>
  );
};

export default Chatbot;

/* Tailwind helper (add once globally):
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
*/
