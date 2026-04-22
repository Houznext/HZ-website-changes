import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import withAdminLayout from "@/src/common/AdminLayout";
import {
  getCmsManagement,
  saveDraft,
  publishCms,
} from "@/src/utils/cmsClient";
import CmsTopBar from "@/src/components/cms/CmsTopBar";
import ImageUploadZone from "@/src/components/cms/ImageUploadZone";

/** ---- types & defaults (interiors_page schema) ---- */
interface HeroCard {
  slot: "living" | "kitchen" | "bedroom";
  label: string;
  imageUrl: string;
  action: "tab" | "url" | "cta" | "none";
  actionValue: string;
}

interface RbRCard {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  action: "tab" | "url" | "cta" | "none";
  actionValue: string;
  visible: boolean;
}

interface RoomByRoom {
  eyebrow: string;
  heading: string;
  cards: RbRCard[];
}

const DEFAULT_HERO = {
  eyebrow: "Home Interiors",
  headline: "Spaces that feel {like} {you.}",
  subheading:
    "Fixed-price interior design for 2BHK, 3BHK and villas. 45-day delivery, photorealistic 3D designs, and live LiveBuild tracking.",
  primaryCta: { label: "Request free consultation →", href: "/contact-us" },
  secondaryCta: { label: "View packages", href: "/pricing" },
};

const DEFAULT_HERO_CARDS: HeroCard[] = [
  {
    slot: "living",
    label: "Living Room",
    imageUrl: "",
    action: "tab",
    actionValue: "living",
  },
  {
    slot: "kitchen",
    label: "Kitchen",
    imageUrl: "",
    action: "tab",
    actionValue: "kitchen",
  },
  {
    slot: "bedroom",
    label: "Master Bedroom",
    imageUrl: "",
    action: "tab",
    actionValue: "bedroom",
  },
];

const DEFAULT_RBR: RoomByRoom = {
  eyebrow: "Room categories",
  heading: "Room by room excellence",
  cards: [
    {
      slug: "living",
      title: "Living Room",
      description:
        "Sofas, TV units, entertainment walls, accent lighting",
      imageUrl: "",
      action: "tab",
      actionValue: "living",
      visible: true,
    },
    {
      slug: "bedroom",
      title: "Bedroom",
      description:
        "Wardrobes, study units, cove ceilings, wall panels",
      imageUrl: "",
      action: "tab",
      actionValue: "bedroom",
      visible: true,
    },
    {
      slug: "kitchen",
      title: "Kitchen",
      description:
        "Modular kitchens, hob, chimney, storage solutions",
      imageUrl: "",
      action: "tab",
      actionValue: "kitchen",
      visible: true,
    },
    {
      slug: "office",
      title: "Home Office",
      description:
        "Ergonomic workstations, storage walls, acoustic panels",
      imageUrl: "",
      action: "tab",
      actionValue: "office",
      visible: true,
    },
  ],
};

const DEFAULT_SEO_INTERIORS = {
  metaTitle:
    "Home Interiors Hyderabad | Fixed-Price Packages | Houznext",
  metaDescription:
    "Modular kitchen, wardrobes, false ceiling, TV unit — fixed-price interior packages from ₹4.5L for 2BHK. 45-day delivery in Hyderabad, Warangal, Karimnagar. Free 3D design.",
  canonical: "/interiors",
  ogImage: "",
};

const CMS_KEY = "interiors_page";

function parseHeadline(raw: string) {
  const parts = raw.split(/(\{[^}]+\})/g);
  return parts.map((part, i) => {
    if (part.startsWith("{") && part.endsWith("}")) {
      return (
        <span key={i} style={{ color: "#2f80ed" }}>
          {part.slice(1, -1)}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

const InteriorsCmsPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<
    "hero" | "gallery" | "roombyroom" | "seo"
  >("hero");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [hero, setHero] = useState(DEFAULT_HERO);
  const [heroCards, setHeroCards] = useState<HeroCard[]>(DEFAULT_HERO_CARDS);
  const [roomByRoom, setRoomByRoom] = useState<RoomByRoom>(DEFAULT_RBR);
  const [seo, setSeo] = useState(DEFAULT_SEO_INTERIORS);

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
      if (data.hero) setHero({ ...DEFAULT_HERO, ...data.hero });
      if (data.heroCards) setHeroCards(data.heroCards);
      if (data.roomByRoom) {
        setRoomByRoom({
          ...DEFAULT_RBR,
          ...data.roomByRoom,
          cards: data.roomByRoom.cards?.length
            ? data.roomByRoom.cards
            : DEFAULT_RBR.cards,
        });
      }
      if (data.seo) setSeo({ ...DEFAULT_SEO_INTERIORS, ...data.seo });
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
    if (!session) {
      void router.replace("/login");
    }
  }, [session, status, router]);

  const collectData = () => ({
    hero,
    heroCards,
    roomByRoom,
    seo,
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
      toast.success("Published! Interiors page is live ✓");
    } else {
      toast.error(r.errorMessage, { duration: 8000 });
    }
  };

  const siteBase =
    (typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_WEBSITE_URL?.replace(/\/$/, "")) ||
    "";

  if (status === "loading") return null;
  if (!session) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] min-h-0 bg-[#f5f7fa]">
      <CmsTopBar
        title="Interiors page CMS"
        subtitle="Hero, gallery cards, room-by-room and SEO"
        previewUrl={siteBase ? `${siteBase}/interiors` : "/interiors"}
        isSaving={isSaving}
        isPublishing={isPublishing}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />
      <div className="flex-1 overflow-y-auto p-5 pb-24">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-32 bg-white rounded-xl border border-[#e2e8f0]" />
            <div className="h-48 bg-white rounded-xl border border-[#e2e8f0]" />
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-4 flex-wrap">
              {(
                [
                  ["hero", "Hero section"],
                  ["gallery", "Hero gallery cards"],
                  ["roombyroom", "Room by room"],
                  ["seo", "SEO"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border-[1.5px] transition-all ${
                    activeTab === id
                      ? "bg-[#2f80ed] text-white border-[#2f80ed]"
                      : "bg-white text-[#5a6a7e] border-[#dde8f5] hover:border-[#2f80ed]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "hero" && (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
                <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 space-y-3">
                  <p className="text-[11px] font-bold text-[#1f2933] uppercase">
                    Hero content
                  </p>
                  <label className="block text-[12px] font-semibold text-[#5a6a7e]">
                    Eyebrow
                    <input
                      className="mt-1 w-full border border-[#dde8f5] rounded-lg px-3 py-2 text-sm"
                      value={hero.eyebrow}
                      onChange={(e) =>
                        setHero((h) => ({ ...h, eyebrow: e.target.value }))
                      }
                    />
                  </label>
                  <label className="block text-[12px] font-semibold text-[#5a6a7e]">
                    Headline (H1)
                    <input
                      className="mt-1 w-full border border-[#dde8f5] rounded-lg px-3 py-2 text-sm"
                      placeholder="Use {word} to colour words in blue"
                      value={hero.headline}
                      onChange={(e) =>
                        setHero((h) => ({ ...h, headline: e.target.value }))
                      }
                    />
                    <span className="text-[11px] text-[#5a6a7e] mt-1 block">
                      Words wrapped in {"{curly braces}"} will be rendered in
                      blue (#2f80ed) on the website.
                    </span>
                  </label>
                  <label className="block text-[12px] font-semibold text-[#5a6a7e]">
                    Sub-heading
                    <textarea
                      rows={3}
                      className="mt-1 w-full border border-[#dde8f5] rounded-lg px-3 py-2 text-sm"
                      value={hero.subheading}
                      onChange={(e) =>
                        setHero((h) => ({ ...h, subheading: e.target.value }))
                      }
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-[12px] font-semibold text-[#5a6a7e]">
                      Primary CTA label
                      <input
                        className="mt-1 w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm"
                        value={hero.primaryCta.label}
                        onChange={(e) =>
                          setHero((h) => ({
                            ...h,
                            primaryCta: {
                              ...h.primaryCta,
                              label: e.target.value,
                            },
                          }))
                        }
                      />
                    </label>
                    <label className="text-[12px] font-semibold text-[#5a6a7e]">
                      Primary CTA href
                      <input
                        className="mt-1 w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm"
                        value={hero.primaryCta.href}
                        onChange={(e) =>
                          setHero((h) => ({
                            ...h,
                            primaryCta: {
                              ...h.primaryCta,
                              href: e.target.value,
                            },
                          }))
                        }
                      />
                    </label>
                    <label className="text-[12px] font-semibold text-[#5a6a7e]">
                      Secondary CTA label
                      <input
                        className="mt-1 w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm"
                        value={hero.secondaryCta.label}
                        onChange={(e) =>
                          setHero((h) => ({
                            ...h,
                            secondaryCta: {
                              ...h.secondaryCta,
                              label: e.target.value,
                            },
                          }))
                        }
                      />
                    </label>
                    <label className="text-[12px] font-semibold text-[#5a6a7e]">
                      Secondary CTA href
                      <input
                        className="mt-1 w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm"
                        value={hero.secondaryCta.href}
                        onChange={(e) =>
                          setHero((h) => ({
                            ...h,
                            secondaryCta: {
                              ...h.secondaryCta,
                              href: e.target.value,
                            },
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>
                <div
                  className="rounded-xl p-4 text-white font-head"
                  style={{ background: "#0f2a44" }}
                >
                  <p className="text-[10px] uppercase tracking-wider text-white/50 mb-2">
                    Live preview
                  </p>
                  <p className="text-[11px] text-white/70 mb-2">{hero.eyebrow}</p>
                  <h2 className="font-black text-[24px] leading-tight mb-2">
                    {parseHeadline(hero.headline)}
                  </h2>
                  <p className="text-[12px] text-white/65 mb-4 leading-relaxed">
                    {hero.subheading}
                  </p>
                  <div className="flex flex-col gap-2">
                    <span
                      className="inline-block text-center py-2 rounded-lg text-[12px] font-bold"
                      style={{ background: "#2f80ed" }}
                    >
                      {hero.primaryCta.label}
                    </span>
                    <span
                      className="inline-block text-center py-2 rounded-lg text-[12px] font-bold border border-white/25"
                    >
                      {hero.secondaryCta.label}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "gallery" && (
              <div className="space-y-3">
                <p className="text-[13px] text-[#5a6a7e]">
                  Three hero tiles (living, kitchen, bedroom). Set click actions
                  for the public site.
                </p>
                {heroCards.map((card, idx) => (
                  <div
                    key={card.slot}
                    className="bg-white border border-[#e2e8f0] rounded-xl p-3.5"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[13px] font-bold text-[#0f2a44]">
                        Card {idx + 1} — {card.label}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#166534]">
                        published
                      </span>
                    </div>
                    <ImageUploadZone
                      value={card.imageUrl}
                      folder={`cms/interiors/hero-cards/${card.slot}`}
                      label="Upload card image"
                      hint={
                        card.slot === "bedroom"
                          ? "Recommended: 1100×400px · JPG/WebP (full width)"
                          : "Recommended: 700×500px · JPG/WebP"
                      }
                      height={card.slot === "bedroom" ? 80 : 110}
                      onUpload={(url) =>
                        setHeroCards((prev) =>
                          prev.map((c) =>
                            c.slot === card.slot ? { ...c, imageUrl: url } : c,
                          ),
                        )
                      }
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                      <label className="text-[11px] font-semibold text-[#5a6a7e]">
                        Card label
                        <input
                          className="mt-1 w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm"
                          value={card.label}
                          onChange={(e) =>
                            setHeroCards((prev) =>
                              prev.map((c) =>
                                c.slot === card.slot
                                  ? { ...c, label: e.target.value }
                                  : c,
                              ),
                            )
                          }
                        />
                      </label>
                      <label className="text-[11px] font-semibold text-[#5a6a7e]">
                        Click action
                        <select
                          className="mt-1 w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm bg-white"
                          value={card.action}
                          onChange={(e) => {
                            const action = e.target.value as HeroCard["action"];
                            setHeroCards((prev) =>
                              prev.map((c) =>
                                c.slot === card.slot
                                  ? {
                                      ...c,
                                      action,
                                      actionValue:
                                        action === "tab"
                                          ? c.slot
                                          : action === "url"
                                            ? c.actionValue
                                            : "",
                                    }
                                  : c,
                              ),
                            );
                          }}
                        >
                          <option value="tab">
                            Open Design ideas — {card.label} tab
                          </option>
                          <option value="url">Go to custom URL</option>
                          <option value="cta">Open free consultation form</option>
                          <option value="none">No action (decorative)</option>
                        </select>
                      </label>
                      {card.action === "url" ? (
                        <label className="text-[11px] font-semibold text-[#5a6a7e]">
                          Custom URL
                          <input
                            className="mt-1 w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm"
                            value={card.actionValue}
                            onChange={(e) =>
                              setHeroCards((prev) =>
                                prev.map((c) =>
                                  c.slot === card.slot
                                    ? { ...c, actionValue: e.target.value }
                                    : c,
                                ),
                              )
                            }
                          />
                        </label>
                      ) : (
                        <div />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "roombyroom" && (
              <div className="space-y-3">
                <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="text-[12px] font-semibold text-[#5a6a7e]">
                    Eyebrow
                    <input
                      className="mt-1 w-full border border-[#dde8f5] rounded-lg px-3 py-2 text-sm"
                      value={roomByRoom.eyebrow}
                      onChange={(e) =>
                        setRoomByRoom((r) => ({
                          ...r,
                          eyebrow: e.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="text-[12px] font-semibold text-[#5a6a7e]">
                    Section heading (H2)
                    <input
                      className="mt-1 w-full border border-[#dde8f5] rounded-lg px-3 py-2 text-sm"
                      value={roomByRoom.heading}
                      onChange={(e) =>
                        setRoomByRoom((r) => ({
                          ...r,
                          heading: e.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
                {roomByRoom.cards.map((card, idx) => (
                  <div
                    key={card.slug}
                    className="bg-white border border-[#e2e8f0] rounded-xl p-3.5"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[13px] font-bold text-[#0f2a44]">
                        Card {idx + 1} — {card.title}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="w-7 h-7 rounded-[7px] border border-[#e2e8f0] bg-white text-[#1f2933] hover:border-[#93c5fd] hover:bg-[#e8f1fd] disabled:opacity-40"
                          disabled={idx === 0}
                          onClick={() =>
                            setRoomByRoom((r) => {
                              const next = [...r.cards];
                              [next[idx - 1], next[idx]] = [
                                next[idx],
                                next[idx - 1],
                              ];
                              return { ...r, cards: next };
                            })
                          }
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="w-7 h-7 rounded-[7px] border border-[#e2e8f0] bg-white text-[#1f2933] hover:border-[#93c5fd] hover:bg-[#e8f1fd] disabled:opacity-40"
                          disabled={idx === roomByRoom.cards.length - 1}
                          onClick={() =>
                            setRoomByRoom((r) => {
                              const next = [...r.cards];
                              [next[idx], next[idx + 1]] = [
                                next[idx + 1],
                                next[idx],
                              ];
                              return { ...r, cards: next };
                            })
                          }
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setRoomByRoom((r) => ({
                              ...r,
                              cards: r.cards.map((c) =>
                                c.slug === card.slug
                                  ? { ...c, visible: !c.visible }
                                  : c,
                              ),
                            }))
                          }
                          className={`text-[10px] font-bold px-2 py-1 rounded-full ml-1 ${
                            card.visible
                              ? "bg-[#dcfce7] text-[#166534]"
                              : "bg-[#f1f5f9] text-[#64748b]"
                          }`}
                        >
                          {card.visible ? "Visible" : "Hidden"}
                        </button>
                      </div>
                    </div>
                    <ImageUploadZone
                      value={card.imageUrl}
                      folder={`cms/interiors/room-by-room/${card.slug}`}
                      label="Upload image"
                      hint="Recommended: 500×320px · dark image preferred"
                      onUpload={(url) =>
                        setRoomByRoom((r) => ({
                          ...r,
                          cards: r.cards.map((c) =>
                            c.slug === card.slug
                              ? { ...c, imageUrl: url }
                              : c,
                          ),
                        }))
                      }
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                      <label className="text-[11px] font-semibold text-[#5a6a7e]">
                        Card title
                        <input
                          className="mt-1 w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm"
                          value={card.title}
                          onChange={(e) =>
                            setRoomByRoom((r) => ({
                              ...r,
                              cards: r.cards.map((c) =>
                                c.slug === card.slug
                                  ? { ...c, title: e.target.value }
                                  : c,
                              ),
                            }))
                          }
                        />
                      </label>
                      <label className="text-[11px] font-semibold text-[#5a6a7e] col-span-1 md:col-span-2">
                        Description
                        <input
                          className="mt-1 w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm"
                          value={card.description}
                          onChange={(e) =>
                            setRoomByRoom((r) => ({
                              ...r,
                              cards: r.cards.map((c) =>
                                c.slug === card.slug
                                  ? { ...c, description: e.target.value }
                                  : c,
                              ),
                            }))
                          }
                        />
                      </label>
                      <label className="text-[11px] font-semibold text-[#5a6a7e]">
                        Click action
                        <select
                          className="mt-1 w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm bg-white"
                          value={card.action}
                          onChange={(e) => {
                            const action = e.target.value as RbRCard["action"];
                            setRoomByRoom((r) => ({
                              ...r,
                              cards: r.cards.map((c) =>
                                c.slug === card.slug
                                  ? {
                                      ...c,
                                      action,
                                      actionValue:
                                        action === "tab"
                                          ? c.slug
                                          : c.actionValue,
                                    }
                                  : c,
                              ),
                            }));
                          }}
                        >
                          <option value="tab">
                            Open Design ideas — {card.title} tab
                          </option>
                          <option value="url">Go to custom URL</option>
                          <option value="cta">Open free consultation form</option>
                          <option value="none">No action</option>
                        </select>
                      </label>
                      {card.action === "url" && (
                        <label className="text-[11px] font-semibold text-[#5a6a7e]">
                          Custom URL
                          <input
                            className="mt-1 w-full border border-[#dde8f5] rounded-lg px-2 py-1.5 text-sm"
                            value={card.actionValue}
                            onChange={(e) =>
                              setRoomByRoom((r) => ({
                                ...r,
                                cards: r.cards.map((c) =>
                                  c.slug === card.slug
                                    ? { ...c, actionValue: e.target.value }
                                    : c,
                                ),
                              }))
                            }
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "seo" && (
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 max-w-2xl space-y-3">
                <p className="text-[12px] font-bold text-[#0f2a44]">
                  SEO — Interiors page
                </p>
                <label className="block text-[12px] font-semibold text-[#5a6a7e]">
                  Meta title
                  <input
                    className="mt-1 w-full border border-[#dde8f5] rounded-lg px-3 py-2 text-sm"
                    value={seo.metaTitle}
                    onChange={(e) =>
                      setSeo((s) => ({ ...s, metaTitle: e.target.value }))
                    }
                  />
                </label>
                <label className="block text-[12px] font-semibold text-[#5a6a7e]">
                  Meta description
                  <textarea
                    rows={3}
                    className="mt-1 w-full border border-[#dde8f5] rounded-lg px-3 py-2 text-sm"
                    value={seo.metaDescription}
                    onChange={(e) =>
                      setSeo((s) => ({ ...s, metaDescription: e.target.value }))
                    }
                  />
                </label>
                <label className="block text-[12px] font-semibold text-[#5a6a7e]">
                  Canonical URL
                  <input
                    className="mt-1 w-full border border-[#dde8f5] rounded-lg px-3 py-2 text-sm"
                    value={seo.canonical}
                    onChange={(e) =>
                      setSeo((s) => ({ ...s, canonical: e.target.value }))
                    }
                  />
                </label>
                <ImageUploadZone
                  value={seo.ogImage}
                  folder="cms/interiors/og"
                  label="Upload OG image"
                  hint="1200×630px"
                  height={60}
                  onUpload={(url) => setSeo((s) => ({ ...s, ogImage: url }))}
                />
              </div>
            )}
          </>
        )}
      </div>
      <div
        className="fixed bottom-0 left-0 right-0 md:left-[256px] border-t border-[#e2e8f0] bg-white px-5 py-3 flex justify-end gap-2 z-10"
        style={{ boxShadow: "0 -4px 20px rgba(15,42,68,0.06)" }}
      >
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={isSaving}
          className="px-4 py-2 rounded-lg text-[12px] font-bold border border-[#dde8f5] text-[#0f2a44] hover:bg-[#e8f1fd] disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save draft"}
        </button>
        <button
          type="button"
          onClick={handlePublish}
          disabled={isPublishing}
          className="px-4 py-2 rounded-lg text-[12px] font-bold bg-[#16a34a] text-white hover:bg-[#15803d] disabled:opacity-50"
        >
          {isPublishing ? "Publishing…" : "Publish live"}
        </button>
      </div>
    </div>
  );
};

export default withAdminLayout(InteriorsCmsPage);
