import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import withAdminLayout from "@/src/common/AdminLayout";
import {
  getCmsManagement,
  saveDraft,
  publishCms,
} from "@/src/utils/cmsClient";
import CmsTopBar from "@/src/components/cms/CmsTopBar";
import ImageUploadZone from "@/src/components/cms/ImageUploadZone";

/* --- schema types --- */
interface RoomCategory {
  slug: string;
  label: string;
  iconUrl: string;
  sortOrder: number;
  visible: boolean;
  action: "tab" | "page";
  actionValue: string;
}

interface DesignCard {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  room: string;
  style: string;
  package: string;
  status: "published" | "draft" | "hidden";
  onclick: "detail" | "modal" | "cta" | "url";
  onclickValue: string;
}

const DEFAULT_ROOMS: RoomCategory[] = [
  { slug: "living", label: "Living room", iconUrl: "", sortOrder: 1, visible: true, action: "tab", actionValue: "living" },
  { slug: "kitchen", label: "Kitchen", iconUrl: "", sortOrder: 2, visible: true, action: "tab", actionValue: "kitchen" },
  { slug: "bedroom", label: "Bedroom", iconUrl: "", sortOrder: 3, visible: true, action: "tab", actionValue: "bedroom" },
  { slug: "bathroom", label: "Bathroom", iconUrl: "", sortOrder: 4, visible: true, action: "tab", actionValue: "bathroom" },
  { slug: "office", label: "Home office", iconUrl: "", sortOrder: 5, visible: true, action: "tab", actionValue: "office" },
  { slug: "kids", label: "Kids room", iconUrl: "", sortOrder: 6, visible: true, action: "tab", actionValue: "kids" },
  { slug: "balcony", label: "Balcony", iconUrl: "", sortOrder: 7, visible: true, action: "tab", actionValue: "balcony" },
  { slug: "pooja", label: "Pooja unit", iconUrl: "", sortOrder: 8, visible: true, action: "tab", actionValue: "pooja" },
  { slug: "foyer", label: "Foyer", iconUrl: "", sortOrder: 9, visible: true, action: "tab", actionValue: "foyer" },
];

const DEFAULT_HEADER = {
  eyebrow: "Design Ideas",
  heading: "Design ideas for every room.",
  subheading:
    "Explore real designs from Houznext homes across Hyderabad, Warangal and Karimnagar.",
};

const DEFAULT_SETTINGS = {
  showStyleFilters: true,
  showBudgetFilters: true,
  showSaveButton: true,
  showLikeCount: false,
};

const DEFAULT_SEO = {
  metaTitle:
    "Interior Design Ideas for Every Room | Houznext Design Gallery Hyderabad",
  metaDescription:
    "Explore 500+ interior design ideas for living rooms, kitchens, bedrooms and more from real Houznext homes in Hyderabad. Filter by style, room and budget.",
  ogImage: "",
};

const STYLE_OPTIONS = [
  "Modern minimalist",
  "Contemporary",
  "Classic",
  "Japandi",
  "Industrial",
  "Luxury",
  "Minimalist",
];

const CMS_KEY = "design_ideas_page";

function StatCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: number;
  sub: string;
  tone?: "green" | "amber" | "default";
}) {
  const border =
    tone === "green"
      ? "border-[#86efac]"
      : tone === "amber"
        ? "border-[#fcd34d]"
        : "border-[#e2e8f0]";
  return (
    <div className={`bg-white rounded-xl border ${border} p-3`}>
      <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wide">
        {label}
      </p>
      <p className="text-[22px] font-head font-black text-[#0f2a44] mt-0.5">
        {value}
      </p>
      <p className="text-[10px] text-[#5a6a7e] mt-0.5">{sub}</p>
    </div>
  );
}

function SaveBar({
  onDraft,
  onPublish,
  isSaving,
  isPublishing,
}: {
  onDraft: () => void;
  onPublish: () => void;
  isSaving: boolean;
  isPublishing: boolean;
}) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 md:left-[256px] border-t border-[#e2e8f0] bg-white px-5 py-3 flex justify-end gap-2 z-10"
      style={{ boxShadow: "0 -4px 20px rgba(15,42,68,0.06)" }}
    >
      <button
        type="button"
        onClick={onDraft}
        disabled={isSaving}
        className="px-4 py-2 rounded-lg text-[12px] font-bold border border-[#dde8f5] text-[#0f2a44] hover:bg-[#e8f1fd] disabled:opacity-50"
      >
        {isSaving ? "Saving…" : "Save draft"}
      </button>
      <button
        type="button"
        onClick={onPublish}
        disabled={isPublishing}
        className="px-4 py-2 rounded-lg text-[12px] font-bold bg-[#16a34a] text-white hover:bg-[#15803d] disabled:opacity-50"
      >
        {isPublishing ? "Publishing…" : "Publish live"}
      </button>
    </div>
  );
}

const DesignIdeasCmsPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"rooms" | "cards" | "settings">(
    "rooms",
  );
  const [roomFilter, setRoomFilter] = useState("all");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCardPanel, setShowCardPanel] = useState(false);
  const [editingCard, setEditingCard] = useState<DesignCard | null>(null);

  const [rooms, setRooms] = useState<RoomCategory[]>(DEFAULT_ROOMS);
  const [cards, setCards] = useState<DesignCard[]>([]);
  const [pageHeader, setPageHeader] = useState(DEFAULT_HEADER);
  const [pageSettings, setPageSettings] = useState(DEFAULT_SETTINGS);
  const [pageSeo, setPageSeo] = useState(DEFAULT_SEO);

  const token =
    (session as { token?: string } | null)?.token ||
    (session as { user?: { token?: string } } | null)?.user?.token ||
    "";

  const load = useCallback(async () => {
    if (!token) return;
    const { data, errorMessage } = await getCmsManagement(CMS_KEY, token);
    if (errorMessage) {
      toast.error(errorMessage, { duration: 8000 });
    }
    if (data) {
      if (data.rooms) setRooms(data.rooms);
      if (data.cards) setCards(data.cards);
      if (data.header) setPageHeader({ ...DEFAULT_HEADER, ...data.header });
      if (data.settings)
        setPageSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      if (data.seo) setPageSeo({ ...DEFAULT_SEO, ...data.seo });
    }
    setIsLoading(false);
  }, [token]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !token) {
      setIsLoading(false);
      return;
    }
    void load();
  }, [status, session, token, load]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) void router.replace("/login");
  }, [session, status, router]);

  const collectData = () => ({
    header: pageHeader,
    rooms,
    cards,
    settings: pageSettings,
    seo: pageSeo,
  });

  const handleSaveDraft = async () => {
    if (!token) {
      toast.error("Not signed in");
      return;
    }
    setIsSaving(true);
    const r = await saveDraft(CMS_KEY, collectData(), token);
    setIsSaving(false);
    if (r.ok) {
      toast.success("Draft saved");
    } else {
      toast.error(r.errorMessage, { duration: 8000 });
    }
  };

  const handlePublish = async () => {
    if (!token) {
      toast.error("Not signed in");
      return;
    }
    setIsPublishing(true);
    const r = await publishCms(CMS_KEY, collectData(), token);
    setIsPublishing(false);
    if (r.ok) {
      toast.success("Published! Design ideas page is live ✓");
    } else {
      toast.error(r.errorMessage, { duration: 8000 });
    }
  };

  const siteBase =
    (typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_WEBSITE_URL?.replace(/\/$/, "")) ||
    "";

  const openNewCard = () => {
    setEditingCard({
      id: uuidv4(),
      title: "",
      description: "",
      imageUrl: "",
      room: rooms[0]?.slug || "living",
      style: "Modern minimalist",
      package: "Premium",
      status: "draft",
      onclick: "detail",
      onclickValue: "",
    });
    setShowCardPanel(true);
  };

  const openEdit = (c: DesignCard) => {
    setEditingCard({ ...c });
    setShowCardPanel(true);
  };

  const persistPanelToCards = (c: DesignCard) => {
    setCards((prev) => {
      const ix = prev.findIndex((x) => x.id === c.id);
      if (ix === -1) return [...prev, c];
      const n = [...prev];
      n[ix] = c;
      return n;
    });
  };

  const deleteCard = (id: string) => {
    if (!window.confirm("Delete this design card?")) return;
    setCards((prev) => prev.filter((c) => c.id !== id));
    setShowCardPanel(false);
    setEditingCard(null);
    toast.success("Card removed");
  };

  const filteredGrid = useMemo(() => {
    if (roomFilter === "all") return cards;
    return cards.filter((c) => c.room === roomFilter);
  }, [cards, roomFilter]);

  if (status === "loading") return null;
  if (!session) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] min-h-0 bg-[#f5f7fa]">
      <CmsTopBar
        title="Design ideas CMS"
        subtitle="Manage room categories, design cards and click actions"
        previewUrl={siteBase ? `${siteBase}/design-ideas` : "/design-ideas"}
        isSaving={isSaving}
        isPublishing={isPublishing}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />
      <div className="flex-1 overflow-y-auto p-5 pb-24">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-16 bg-white rounded-xl border border-[#e2e8f0]" />
            <div className="h-32 bg-white rounded-xl border border-[#e2e8f0]" />
            <div className="h-64 bg-white rounded-xl border border-[#e2e8f0]" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
              <StatCard
                label="Room categories"
                value={rooms.length}
                sub="Tab strip entries"
              />
              <StatCard
                label="Total designs"
                value={cards.length}
                sub="Across all rooms"
              />
              <StatCard
                label="Published"
                value={cards.filter((c) => c.status === "published").length}
                sub="Live on website"
                tone="green"
              />
              <StatCard
                label="Drafts"
                value={cards.filter((c) => c.status === "draft").length}
                sub="Not yet published"
                tone="amber"
              />
            </div>
            <div className="mb-4 rounded-xl border border-[#bfdbfe] bg-[#f0f7ff] px-4 py-3 text-[12px] text-[#1f2933]">
              Content syncs to the public site when you <strong>Publish live</strong>
              . Drafts stay in the admin until published.
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {(
                [
                  ["rooms", "Rooms"],
                  ["cards", "Cards"],
                  ["settings", "Settings"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border-[1.5px] transition-all ${
                    activeTab === id
                      ? "bg-[#2f80ed] text-white border-[#2f80ed]"
                      : "bg-white text-[#5a6a7e] border-[#dde8f5] hover:border-[#2f80ed] hover:text-[#2f80ed] hover:bg-[#e8f1fd]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "rooms" && (
              <div>
                <div className="flex justify-end mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (rooms.length >= 12) {
                        toast.error("Maximum 12 rooms");
                        return;
                      }
                      const n = `room-${Date.now()}`;
                      setRooms((r) => [
                        ...r,
                        {
                          slug: n,
                          label: "New room",
                          iconUrl: "",
                          sortOrder: r.length + 1,
                          visible: true,
                          action: "tab",
                          actionValue: n,
                        },
                      ]);
                    }}
                    className="text-[12px] font-bold text-[#2f80ed] hover:underline"
                  >
                    + Add room
                  </button>
                </div>
                <div className="space-y-3">
                  {rooms.map((room, idx) => (
                    <div
                      key={room.slug}
                      className="bg-white border border-[#e2e8f0] rounded-xl p-3 grid grid-cols-1 lg:grid-cols-[100px_1fr_auto] gap-3"
                    >
                      <ImageUploadZone
                        value={room.iconUrl}
                        folder={`cms/design-ideas/rooms/${room.slug}/icon`}
                        label="Tab icon"
                        hint="32×32px"
                        height={72}
                        onUpload={(url) =>
                          setRooms((prev) =>
                            prev.map((r) =>
                              r.slug === room.slug
                                ? { ...r, iconUrl: url }
                                : r,
                            ),
                          )
                        }
                      />
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <label className="text-[11px] font-bold text-[#5a6a7e]">
                            Tab label
                            <input
                              className="mt-1 w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm"
                              value={room.label}
                              onChange={(e) =>
                                setRooms((prev) =>
                                  prev.map((r) =>
                                    r.slug === room.slug
                                      ? { ...r, label: e.target.value }
                                      : r,
                                  ),
                                )
                              }
                            />
                          </label>
                          <label className="text-[11px] font-bold text-[#5a6a7e]">
                            Slug (URL)
                            <input
                              readOnly
                              className="mt-1 w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm bg-[#f1f5f9] text-[#64748b]"
                              value={room.slug}
                            />
                          </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                          <label className="text-[11px] font-bold text-[#5a6a7e]">
                            Sort order
                            <input
                              type="number"
                              className="mt-1 w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm"
                              value={room.sortOrder}
                              onChange={(e) =>
                                setRooms((prev) =>
                                  prev.map((r) =>
                                    r.slug === room.slug
                                      ? {
                                          ...r,
                                          sortOrder: Number(e.target.value) || 0,
                                        }
                                      : r,
                                  ),
                                )
                              }
                            />
                          </label>
                          <div className="flex items-end gap-2 pb-1">
                            <span className="text-[11px] font-bold text-[#5a6a7e]">
                              Visible
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setRooms((prev) =>
                                  prev.map((r) =>
                                    r.slug === room.slug
                                      ? { ...r, visible: !r.visible }
                                      : r,
                                  ),
                                )
                              }
                              className={`relative w-9 h-5 rounded-full transition-colors ${
                                room.visible ? "bg-[#2f80ed]" : "bg-[#e2e8f0]"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                                  room.visible ? "translate-x-4" : ""
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <label className="text-[11px] font-bold text-[#5a6a7e]">
                            Click action
                            <select
                              className="mt-1 w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm bg-white"
                              value={room.action}
                              onChange={(e) => {
                                const action = e.target.value as
                                  | "tab"
                                  | "page";
                                setRooms((prev) =>
                                  prev.map((r) =>
                                    r.slug === room.slug
                                      ? { ...r, action }
                                      : r,
                                  ),
                                );
                              }}
                            >
                              <option value="tab">Open tab on Design ideas</option>
                              <option value="page">Go to separate page</option>
                            </select>
                          </label>
                          {room.action === "page" && (
                            <label className="text-[11px] font-bold text-[#5a6a7e]">
                              Target URL
                              <input
                                className="mt-1 w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm"
                                placeholder="/design-ideas/living-room"
                                value={room.actionValue}
                                onChange={(e) =>
                                  setRooms((prev) =>
                                    prev.map((r) =>
                                      r.slug === room.slug
                                        ? { ...r, actionValue: e.target.value }
                                        : r,
                                    ),
                                  )
                                }
                              />
                            </label>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 items-stretch">
                        <button
                          type="button"
                          className="w-7 h-7 rounded-[7px] border border-[#e2e8f0] bg-white text-[#1f2933] hover:border-[#93c5fd] hover:bg-[#e8f1fd] disabled:opacity-40"
                          disabled={idx === 0}
                          onClick={() =>
                            setRooms((r) => {
                              const n = [...r];
                              [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]];
                              return n;
                            })
                          }
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="w-7 h-7 rounded-[7px] border border-[#e2e8f0] bg-white text-[#1f2933] hover:border-[#93c5fd] hover:bg-[#e8f1fd] disabled:opacity-40"
                          disabled={idx === rooms.length - 1}
                          onClick={() =>
                            setRooms((r) => {
                              const n = [...r];
                              [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]];
                              return n;
                            })
                          }
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="w-7 h-7 rounded-[7px] border border-[#e2e8f0] bg-white text-[#1f2933] hover:border-[#93c5fd] hover:bg-[#e8f1fd]"
                          onClick={() => {
                            const u = siteBase || "";
                            const path = u
                              ? `${u}/design-ideas?tab=${encodeURIComponent(room.slug)}`
                              : `/design-ideas?tab=${encodeURIComponent(room.slug)}`;
                            window.open(path, "_blank", "noopener,noreferrer");
                          }}
                          title="Preview"
                        >
                          👁
                        </button>
                        <button
                          type="button"
                          className="w-7 h-7 rounded-[7px] border border-[#e2e8f0] bg-white text-red-600 hover:border-[#dc2626] hover:bg-[#fff1f2]"
                          onClick={() => {
                            if (rooms.length <= 1) {
                              toast.error("Keep at least one room");
                              return;
                            }
                            if (!window.confirm("Remove this room?")) return;
                            setRooms((r) => r.filter((x) => x.slug !== room.slug));
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "cards" && (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <p className="text-[14px] font-bold text-[#0f2a44]">
                    Design cards
                  </p>
                  <button
                    type="button"
                    onClick={openNewCard}
                    className="px-3 py-1.5 rounded-lg bg-[#2f80ed] text-white text-[12px] font-bold hover:bg-[#1a6dd6]"
                  >
                    Upload design
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setRoomFilter("all")}
                    className={`px-3 py-1 rounded-full text-[12px] font-semibold border-[1.5px] ${
                      roomFilter === "all"
                        ? "bg-[#2f80ed] text-white border-[#2f80ed]"
                        : "bg-white text-[#5a6a7e] border-[#dde8f5] hover:border-[#2f80ed] hover:text-[#2f80ed] hover:bg-[#e8f1fd]"
                    }`}
                  >
                    All rooms
                  </button>
                  {rooms.map((r) => (
                    <button
                      key={r.slug}
                      type="button"
                      onClick={() => setRoomFilter(r.slug)}
                      className={`px-3 py-1 rounded-full text-[12px] font-semibold border-[1.5px] ${
                        roomFilter === r.slug
                          ? "bg-[#2f80ed] text-white border-[#2f80ed]"
                          : "bg-white text-[#5a6a7e] border-[#dde8f5] hover:border-[#2f80ed] hover:text-[#2f80ed] hover:bg-[#e8f1fd]"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <div
                  className="grid gap-2.5"
                  style={{
                    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                  }}
                >
                  <button
                    type="button"
                    onClick={openNewCard}
                    className="min-h-[200px] border-2 border-dashed border-[#bfdbfe] bg-[#f0f7ff] rounded-[10px] flex flex-col items-center justify-center gap-2 text-[#2f80ed] font-bold text-[12px] hover:border-[#2f80ed] hover:bg-[#dbeafe] transition-all"
                  >
                    <span className="text-2xl">+</span>
                    Upload new design card
                  </button>
                  {filteredGrid.map((card) => (
                    <div
                      key={card.id}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") openEdit(card);
                      }}
                      className="group relative bg-white border-[0.5px] border-[#e2e8f0] rounded-[10px] overflow-hidden cursor-pointer transition-all duration-200 hover:border-[#93c5fd] hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(15,42,68,0.09)]"
                      onClick={() => openEdit(card)}
                    >
                      <div className="h-[110px] bg-[#f5f7fa] relative">
                        {card.imageUrl ? (
                          <img
                            src={card.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#94a3b8] text-[10px] font-bold">
                            Photo
                          </div>
                        )}
                        <button
                          type="button"
                          className="absolute top-1.5 right-1.5 w-[22px] h-[22px] rounded-full bg-[rgba(220,38,38,0.9)] text-white text-[12px] leading-[22px] opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCard(card.id);
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <div className="p-2">
                        <p className="text-[12px] font-bold text-[#1f2933] line-clamp-2">
                          {card.title || "Untitled"}
                        </p>
                        <p className="text-[10px] text-[#5a6a7e] mt-1">
                          {card.room} · {card.style} · {card.package}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {showCardPanel && editingCard && (
                  <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 mt-4">
                    <p className="text-[13px] font-bold text-[#0f2a44] mb-3 flex items-center gap-2">
                      <span>✎</span> Edit design card —{" "}
                      <span className="text-[#94a3b8] font-normal">
                        {editingCard.title || "New"}
                      </span>
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4">
                      <div>
                        <ImageUploadZone
                          value={editingCard.imageUrl}
                          folder={`cms/design-ideas/cards/${editingCard.id}`}
                          label="Card image"
                          hint="Recommended: 600×450px"
                          height={100}
                          onUpload={(url) =>
                            setEditingCard((c) => (c ? { ...c, imageUrl: url } : c))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#5a6a7e] block">
                          Design title
                          <input
                            className="mt-1 w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm"
                            value={editingCard.title}
                            onChange={(e) =>
                              setEditingCard((c) =>
                                c ? { ...c, title: e.target.value } : c,
                              )
                            }
                          />
                        </label>
                        <label className="text-[11px] font-bold text-[#5a6a7e] block">
                          Short description
                          <textarea
                            rows={3}
                            className="mt-1 w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm"
                            value={editingCard.description}
                            onChange={(e) =>
                              setEditingCard((c) =>
                                c ? { ...c, description: e.target.value } : c,
                              )
                            }
                          />
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <label className="text-[11px] font-bold text-[#5a6a7e]">
                            Room
                            <select
                              className="mt-1 w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm bg-white"
                              value={editingCard.room}
                              onChange={(e) =>
                                setEditingCard((c) =>
                                  c ? { ...c, room: e.target.value } : c,
                                )
                              }
                            >
                              {rooms.map((r) => (
                                <option key={r.slug} value={r.slug}>
                                  {r.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="text-[11px] font-bold text-[#5a6a7e]">
                            Style
                            <select
                              className="mt-1 w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm bg-white"
                              value={editingCard.style}
                              onChange={(e) =>
                                setEditingCard((c) =>
                                  c ? { ...c, style: e.target.value } : c,
                                )
                              }
                            >
                              {STYLE_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <label className="text-[11px] font-bold text-[#5a6a7e]">
                            Package
                            <select
                              className="mt-1 w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm bg-white"
                              value={editingCard.package}
                              onChange={(e) =>
                                setEditingCard((c) =>
                                  c ? { ...c, package: e.target.value } : c,
                                )
                              }
                            >
                              {["Essential", "Premium", "Luxury"].map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="text-[11px] font-bold text-[#5a6a7e]">
                            Status
                            <select
                              className="mt-1 w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm bg-white"
                              value={editingCard.status}
                              onChange={(e) =>
                                setEditingCard((c) =>
                                  c
                                    ? {
                                        ...c,
                                        status: e.target
                                          .value as DesignCard["status"],
                                      }
                                    : c,
                                )
                              }
                            >
                              <option value="published">Published</option>
                              <option value="draft">Draft</option>
                              <option value="hidden">Hidden</option>
                            </select>
                          </label>
                        </div>
                        <p className="text-[11px] font-bold text-[#0f2a44]">
                          Click action
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(
                            [
                              ["detail", "Open design detail page"],
                              ["modal", "Open lightbox modal"],
                              ["cta", "Open free consultation"],
                              ["url", "Go to custom URL"],
                            ] as const
                          ).map(([v, label]) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() =>
                                setEditingCard((c) =>
                                  c ? { ...c, onclick: v } : c,
                                )
                              }
                              className={`rounded-lg px-3.5 py-1.5 text-[12px] font-semibold border-[1.5px] transition-all ${
                                editingCard.onclick === v
                                  ? "bg-[#2f80ed] text-white border-[#2f80ed]"
                                  : "bg-white text-[#5a6a7e] border-[#e2e8f0] hover:border-[#2f80ed] hover:text-[#2f80ed] hover:bg-[#e8f1fd]"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                        {editingCard.onclick === "url" && (
                          <input
                            className="w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm mt-1"
                            placeholder="https://"
                            value={editingCard.onclickValue}
                            onChange={(e) =>
                              setEditingCard((c) =>
                                c
                                  ? { ...c, onclickValue: e.target.value }
                                  : c,
                              )
                            }
                          />
                        )}
                        <div className="flex justify-end flex-wrap gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowCardPanel(false);
                              setEditingCard(null);
                            }}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-bold border border-[#e2e8f0] text-[#64748b]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (editingCard)
                                deleteCard(editingCard.id);
                            }}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-red-600 border border-red-200"
                          >
                            Delete card
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!editingCard) return;
                              persistPanelToCards(editingCard);
                              toast.success("Card saved to draft (local)");
                            }}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-bold border border-[#e2e8f0] text-[#0f2a44]"
                          >
                            Save draft
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!editingCard) return;
                              const next = { ...editingCard, status: "published" as const };
                              setEditingCard(next);
                              persistPanelToCards(next);
                              toast.success("Card published to website ✓");
                            }}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-bold bg-[#16a34a] text-white"
                          >
                            Publish ✓
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-4 max-w-2xl">
                <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 space-y-2">
                  <p className="text-[12px] font-bold text-[#0f2a44]">Page header</p>
                  <input
                    className="w-full border border-[#dde8f5] rounded-lg px-3 py-2 text-sm"
                    placeholder="Eyebrow"
                    value={pageHeader.eyebrow}
                    onChange={(e) =>
                      setPageHeader((h) => ({ ...h, eyebrow: e.target.value }))
                    }
                  />
                  <input
                    className="w-full border border-[#dde8f5] rounded-lg px-3 py-2 text-sm"
                    placeholder="Headline (H1)"
                    value={pageHeader.heading}
                    onChange={(e) =>
                      setPageHeader((h) => ({ ...h, heading: e.target.value }))
                    }
                  />
                  <textarea
                    rows={2}
                    className="w-full border border-[#dde8f5] rounded-lg px-3 py-2 text-sm"
                    placeholder="Sub-heading"
                    value={pageHeader.subheading}
                    onChange={(e) =>
                      setPageHeader((h) => ({ ...h, subheading: e.target.value }))
                    }
                  />
                </div>
                <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 space-y-2">
                  <p className="text-[12px] font-bold text-[#0f2a44]">SEO</p>
                  <input
                    className="w-full border border-[#dde8f5] rounded-lg px-3 py-2 text-sm"
                    value={pageSeo.metaTitle}
                    onChange={(e) =>
                      setPageSeo((s) => ({ ...s, metaTitle: e.target.value }))
                    }
                  />
                  <textarea
                    rows={3}
                    className="w-full border border-[#dde8f5] rounded-lg px-3 py-2 text-sm"
                    value={pageSeo.metaDescription}
                    onChange={(e) =>
                      setPageSeo((s) => ({
                        ...s,
                        metaDescription: e.target.value,
                      }))
                    }
                  />
                  <ImageUploadZone
                    value={pageSeo.ogImage}
                    folder="cms/design-ideas/og"
                    label="Upload OG image"
                    hint="1200×630px"
                    height={60}
                    onUpload={(url) =>
                      setPageSeo((s) => ({ ...s, ogImage: url }))
                    }
                  />
                </div>
                <div className="bg-white border border-[#e2e8f0] rounded-xl p-4">
                  <p className="text-[12px] font-bold text-[#0f2a44] mb-2">
                    Display settings
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(
                      [
                        ["showStyleFilters", "Show style filters"],
                        ["showBudgetFilters", "Show budget filters"],
                        ["showSaveButton", "Show save button on cards"],
                        ["showLikeCount", "Show like count"],
                      ] as const
                    ).map(([k, label]) => (
                      <label
                        key={k}
                        className="flex items-center justify-between gap-2 text-[12px] text-[#1f2933] font-semibold border border-[#f1f5f9] rounded-lg px-3 py-2"
                      >
                        {label}
                        <input
                          type="checkbox"
                          checked={pageSettings[k] as boolean}
                          onChange={() =>
                            setPageSettings((s) => ({ ...s, [k]: !s[k] }))
                          }
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <SaveBar
        onDraft={handleSaveDraft}
        onPublish={handlePublish}
        isSaving={isSaving}
        isPublishing={isPublishing}
      />
    </div>
  );
};

export default withAdminLayout(DesignIdeasCmsPage);
