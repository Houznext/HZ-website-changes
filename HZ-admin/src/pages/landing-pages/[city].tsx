import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import withAdminLayout from "@/src/common/AdminLayout";
import apiClient from "@/src/utils/apiClient";
import { uploadFile } from "@/src/utils/uploadFile";
import {
  CMS_ANIM,
  CmsCard,
  CmsInput,
  CmsMiniPreview,
  CmsPageHeader,
  CmsSectionTitle,
  CmsSpinner,
  CmsStickyFooter,
  CmsTextarea,
  CmsToast,
  CmsToggle,
  Ico,
  useCmsToast,
} from "@/src/components/cms/servicesCmsUi";

import { getAdminCityConfig, type AdminCitySlug } from "@/src/lib/cityLandingRegistry";

type Content = Record<string, unknown>;

type SectionTab =
  | "hero"
  | "stats"
  | "intro"
  | "services"
  | "process"
  | "pricing"
  | "why"
  | "reviews"
  | "faq";

const SECTION_TABS: { id: SectionTab; label: string; landingLabel: string }[] = [
  { id: "hero", label: "Hero & SEO", landingLabel: "Hero" },
  { id: "stats", label: "Stats strip", landingLabel: "Stats" },
  { id: "intro", label: "Intro", landingLabel: "Intro" },
  { id: "services", label: "Services", landingLabel: "Services" },
  { id: "process", label: "Process", landingLabel: "Process" },
  { id: "pricing", label: "Pricing", landingLabel: "Pricing" },
  { id: "why", label: "Why Houznext", landingLabel: "Why us" },
  { id: "reviews", label: "Testimonials", landingLabel: "Reviews" },
  { id: "faq", label: "FAQ & CTA", landingLabel: "FAQ" },
];

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT || "http://localhost:4000").replace(/\/$/, "");
}

function websiteBase() {
  return (process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3001").replace(/\/$/, "");
}

function revalidateSecret() {
  return process.env.NEXT_PUBLIC_REVALIDATE_SECRET || "houznext-dev-revalidate";
}

function heroImageOpacityPercent(hero: Record<string, unknown>): number {
  const n = Number(hero.heroImageOpacity);
  if (!Number.isFinite(n)) return 22;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function mergeLoaded(defaults: Content, saved: Content | null | undefined): Content {
  if (!saved || typeof saved !== "object" || !Object.keys(saved).length) return defaults;
  const out = JSON.parse(JSON.stringify(defaults)) as Content;
  for (const key of Object.keys(saved)) {
    const val = saved[key];
    if (val === undefined) continue;
    if (Array.isArray(val)) {
      out[key] = val;
    } else if (val && typeof val === "object" && out[key] && typeof out[key] === "object" && !Array.isArray(out[key])) {
      out[key] = { ...(out[key] as Record<string, unknown>), ...(val as Record<string, unknown>) };
    } else {
      out[key] = val;
    }
  }
  return out;
}

function setByPath(root: Record<string, unknown>, path: string[], value: unknown) {
  let cur: Record<string, unknown> | unknown[] = root;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    const nextKey = path[i + 1];
    const isNextIndex = /^\d+$/.test(nextKey);
    if (Array.isArray(cur)) {
      const idx = Number(key);
      if (cur[idx] === undefined || cur[idx] === null) cur[idx] = isNextIndex ? [] : {};
      cur = cur[idx] as Record<string, unknown> | unknown[];
    } else {
      if (typeof cur[key] !== "object" || cur[key] === null) cur[key] = isNextIndex ? [] : {};
      cur = cur[key] as Record<string, unknown> | unknown[];
    }
  }
  const last = path[path.length - 1];
  if (Array.isArray(cur)) cur[Number(last)] = value;
  else cur[last] = value;
}

function SectionHeaderFields({
  eyebrow,
  title,
  subtitle,
  onEyebrow,
  onTitle,
  onSubtitle,
  subtitleRows = 2,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  onEyebrow: (v: string) => void;
  onTitle: (v: string) => void;
  onSubtitle: (v: string) => void;
  subtitleRows?: number;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
      <CmsInput label="Section eyebrow" value={eyebrow} onChange={onEyebrow} />
      <CmsInput label="Section title" value={title} onChange={onTitle} />
      <div style={{ gridColumn: "1 / -1" }}>
        <CmsTextarea label="Section subtitle" value={subtitle} onChange={onSubtitle} rows={subtitleRows} />
      </div>
    </div>
  );
}

function VikarabadLandingCmsPage() {
  const router = useRouter();
  const citySlug = (typeof router.query.city === "string" ? router.query.city : "vikarabad") as AdminCitySlug;
  const cityConfig = getAdminCityConfig(citySlug);
  const CMS_KEY = cityConfig?.cmsKey ?? "landing_vikarabad";
  const LANDING_PATH = cityConfig?.path ?? "/interior-designers-in-vikarabad";
  const cityLabel = cityConfig?.label ?? "Vikarabad";

  const { status } = useSession();
  const { toastMsg, toastVisible, showToast } = useCmsToast();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<SectionTab>("hero");
  const heroImageInputRef = useRef<HTMLInputElement | null>(null);
  const [heroImageUploading, setHeroImageUploading] = useState(false);
  const loadedRef = useRef(false);

  const loadDefaults = useCallback(async () => {
    const res = await fetch(`/api/city-landing-defaults?city=${citySlug}`);
    if (!res.ok) throw new Error("defaults fetch failed");
    return (await res.json()) as Content;
  }, [citySlug]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const defaults = await loadDefaults();
      const res = await fetch(`${apiBase()}/site-cms/${CMS_KEY}`);
      const json = (await res.json()) as { data?: Content };
      setContent(mergeLoaded(defaults, json?.data));
    } catch {
      try {
        setContent(await loadDefaults());
      } catch {
        showToast("Could not load CMS defaults. Start HZ-website dev server.");
        setContent({});
      }
    } finally {
      setLoading(false);
    }
  }, [loadDefaults, showToast, CMS_KEY]);

  useEffect(() => {
    loadedRef.current = false;
    setContent(null);
    setLoading(true);
    void load().finally(() => {
      loadedRef.current = true;
    });
  }, [citySlug, load]);

  const patch = (path: string[], value: unknown) => {
    setContent((prev) => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as Content;
      setByPath(next, path, value);
      return next;
    });
    setDirty(true);
  };

  const handleHeroImageUpload = async (file: File) => {
    setHeroImageUploading(true);
    try {
      const url = await uploadFile(file, `cms/${citySlug}-landing/hero`, undefined, undefined, () => {});
      if (url) {
        patch(["hero", "heroImageUrl"], url);
        showToast("Hero image uploaded");
      } else {
        showToast("Hero image upload failed");
      }
    } catch {
      showToast("Hero image upload failed");
    } finally {
      setHeroImageUploading(false);
    }
  };

  const saveToApi = async () => {
    if (!content) return false;
    await apiClient.post(`${apiBase()}/site-cms/upsert`, { key: CMS_KEY, data: JSON.stringify(content) }, true);
    return true;
  };

  const revalidateLanding = async () => {
    try {
      await fetch(`${websiteBase()}/api/revalidate-city-landing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: revalidateSecret(), city: citySlug }),
      });
    } catch {
      /* ISR fallback within ~30s */
    }
  };

  const saveDraft = async () => {
    if (!content) return;
    setSaving(true);
    try {
      await saveToApi();
      setDirty(false);
      showToast("Saved as draft — not yet live on website");
    } catch {
      showToast("Save failed — please try again");
    }
    setSaving(false);
  };

  const publishLive = async () => {
    if (!content) return;
    setSaving(true);
    try {
      await saveToApi();
      await revalidateLanding();
      setDirty(false);
      showToast(`Published! ${cityLabel} landing page updated live ✓`);
    } catch {
      showToast("Publish failed — check login and API");
    }
    setSaving(false);
  };

  if (!cityConfig) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
        Unknown city landing page.
      </div>
    );
  }

  if (status === "loading" || loading) {
    return (
      <>
        <style>{CMS_ANIM}</style>
        <CmsSpinner />
      </>
    );
  }
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") void router.replace("/login");
    return null;
  }
  if (!content) return null;

  const seo = (content.seo as Record<string, string>) || {};
  const hero = (content.hero as Record<string, unknown>) || {};
  const intro = (content.intro as Record<string, unknown>) || {};
  const services = (content.services as Record<string, unknown>) || {};
  const process = (content.process as Record<string, unknown>) || {};
  const pricing = (content.pricing as Record<string, unknown>) || {};
  const whyUs = (content.whyUs as Record<string, unknown>) || {};
  const testimonials = (content.testimonials as Record<string, unknown>) || {};
  const faq = (content.faq as Record<string, unknown>) || {};
  const cta = (content.cta as Record<string, string>) || {};
  const stats = Array.isArray(content.stats) ? content.stats : [];
  const serviceItems = Array.isArray(services.items) ? services.items : [];
  const processSteps = Array.isArray(process.steps) ? process.steps : [];
  const pricingPackages = Array.isArray(pricing.packages) ? pricing.packages : [];
  const whyItems = Array.isArray(whyUs.items) ? whyUs.items : [];
  const testimonialItems = Array.isArray(testimonials.items) ? testimonials.items : [];
  const faqItems = Array.isArray(faq.items) ? faq.items : [];
  const heroOpacity = heroImageOpacityPercent(hero);

  const previewUrl = `${websiteBase()}${LANDING_PATH}`;

  return (
    <>
      <style>{CMS_ANIM}</style>

      <CmsPageHeader
        title={`${cityLabel} Landing Page CMS`}
        previewUrl={previewUrl}
        onSaveDraft={() => void saveDraft()}
        isSaving={saving}
        liveLabel={`Linked to ${LANDING_PATH}`}
      />

      <div style={{ padding: 20, paddingBottom: 100 }}>
        <div
          style={{
            background: "#fff",
            border: "1.5px solid #e2e8f0",
            borderRadius: 11,
            padding: "12px 16px",
            marginBottom: 18,
            display: "flex",
            alignItems: "flex-start",
            gap: 9,
            fontSize: 13,
            color: "#64748b",
            lineHeight: 1.55,
          }}
        >
          <Ico d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 8v4M12 16h.01" size={14} stroke="#2f80ed" />
          <span>
            Edit each section in the same order as the {cityLabel} landing page. Navbar and footer are fixed on the website.
            Click <strong style={{ color: "#0f2a44" }}>Publish live</strong> to push changes to{" "}
            <code style={{ background: "#f1f5f9", padding: "1px 6px", borderRadius: 4 }}>{LANDING_PATH}</code>.
          </span>
        </div>

        <p style={{ fontSize: 11.5, color: "#94a3b8", margin: "0 0 14px" }}>
          CMS key: <code style={{ background: "#f1f5f9", padding: "1px 6px", borderRadius: 4 }}>site-cms/{CMS_KEY}</code>
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0,
            borderBottom: "1.5px solid #e2e8f0",
            marginBottom: 16,
            overflow: "hidden",
          }}
        >
          {SECTION_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "9px 14px",
                fontSize: 11.5,
                fontWeight: 700,
                color: activeTab === tab.id ? "#2f80ed" : "#64748b",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                borderBottom: activeTab === tab.id ? "2.5px solid #2f80ed" : "2.5px solid transparent",
                marginBottom: 0,
                whiteSpace: "nowrap",
                lineHeight: 1.3,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "hero" && (
          <>
            <CmsCard>
              <CmsSectionTitle title="SEO (page head)" badge="Not visible on page body" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                <CmsInput label="Page title" value={seo.title || ""} onChange={(v) => patch(["seo", "title"], v)} />
                <CmsTextarea label="Meta description" value={seo.description || ""} onChange={(v) => patch(["seo", "description"], v)} rows={2} />
                <CmsTextarea label="Keywords" value={seo.keywords || ""} onChange={(v) => patch(["seo", "keywords"], v)} rows={2} />
              </div>
            </CmsCard>

            <CmsCard>
              <CmsSectionTitle title="Hero section" badge={LANDING_PATH} />
              <CmsMiniPreview label="Hero" dark>
                <div style={{ position: "relative", minHeight: 100 }}>
                  {hero.heroImageUrl ? (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url(${String(hero.heroImageUrl)})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: heroOpacity / 100,
                        borderRadius: 6,
                      }}
                    />
                  ) : null}
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#2f80ed", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                      {String(hero.eyebrow || "Eyebrow")}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.25, marginBottom: 8 }}>
                      {String(hero.titleBefore || "")}
                      <span style={{ color: "#2f80ed" }}>{String(hero.titleHighlight || "")}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
                      {(String(hero.subtitle || "")).slice(0, 140)}
                      {(String(hero.subtitle || "")).length > 140 ? "…" : ""}
                    </div>
                  </div>
                </div>
              </CmsMiniPreview>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
                  Hero background image
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  style={{ display: "none" }}
                  ref={heroImageInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) void handleHeroImageUpload(file);
                  }}
                />
                <button
                  type="button"
                  disabled={heroImageUploading}
                  onClick={() => heroImageInputRef.current?.click()}
                  style={{
                    width: "100%",
                    height: 120,
                    borderRadius: 9,
                    marginBottom: 10,
                    border: hero.heroImageUrl ? "none" : "2px dashed #bfdbfe",
                    background: hero.heroImageUrl ? "#0f2a44" : "#e8f1fd",
                    cursor: heroImageUploading ? "wait" : "pointer",
                    overflow: "hidden",
                    position: "relative",
                    padding: 0,
                    fontFamily: "inherit",
                  }}
                >
                  {hero.heroImageUrl ? (
                    <>
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backgroundImage: `url(${String(hero.heroImageUrl)})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          opacity: heroOpacity / 100,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(165deg, #0f2a44 0%, #1a3d5c 60%, #0d2538 100%)",
                          opacity: 0.55,
                        }}
                      />
                      <div
                        style={{
                          position: "relative",
                          zIndex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          gap: 6,
                        }}
                      >
                        <Ico d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" size={18} stroke="#fff" />
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>
                          {heroImageUploading ? "Uploading…" : "Click to change image"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, height: "100%" }}>
                      <Ico d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" size={22} stroke="#2f80ed" />
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#2f80ed" }}>
                        {heroImageUploading ? "Uploading…" : "Click to upload hero background"}
                      </span>
                      <span style={{ fontSize: 10, color: "#94a3b8" }}>JPG, PNG or WebP · Max 4MB</span>
                    </div>
                  )}
                </button>
                <CmsInput
                  label="Or paste image URL"
                  value={String(hero.heroImageUrl || "")}
                  onChange={(v) => patch(["hero", "heroImageUrl"], v)}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Image transparency
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#2f80ed" }}>{heroOpacity}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={heroOpacity}
                  onChange={(e) => patch(["hero", "heroImageOpacity"], Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#2f80ed", cursor: "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
                  <span>0% — hidden</span>
                  <span>100% — full image</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <CmsInput label="Eyebrow" value={String(hero.eyebrow || "")} onChange={(v) => patch(["hero", "eyebrow"], v)} />
                <CmsInput label="Title highlight (city)" value={String(hero.titleHighlight || "")} onChange={(v) => patch(["hero", "titleHighlight"], v)} />
                <CmsInput label="Title (before highlight)" value={String(hero.titleBefore || "")} onChange={(v) => patch(["hero", "titleBefore"], v)} />
              </div>
              <CmsTextarea label="Hero subtitle" value={String(hero.subtitle || "")} onChange={(v) => patch(["hero", "subtitle"], v)} rows={4} />
              <div style={{ marginTop: 10 }}>
                <CmsTextarea
                  label="Trust badges (one per line)"
                  value={((hero.trustBadges as string[]) || []).join("\n")}
                  onChange={(v) => patch(["hero", "trustBadges"], v.split("\n").map((s) => s.trim()).filter(Boolean))}
                  rows={4}
                />
              </div>
            </CmsCard>
          </>
        )}

        {activeTab === "stats" && (
          <CmsCard>
            <CmsSectionTitle title="Stats strip" badge={`${stats.length} stats`} />
            <CmsMiniPreview label="Stats">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {stats.map((s, i) => {
                  const row = s as Record<string, string>;
                  return (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#0f2a44" }}>{row.n}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#0f2a44" }}>{row.l}</div>
                      <div style={{ fontSize: 9, color: "#64748b" }}>{row.s}</div>
                    </div>
                  );
                })}
              </div>
            </CmsMiniPreview>
            {stats.map((s, i) => {
              const row = s as Record<string, string>;
              return (
                <div key={i} style={{ marginBottom: 12, padding: 12, background: "#f8fafc", borderRadius: 9, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#0f2a44", marginBottom: 8 }}>Stat {i + 1}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    <CmsInput label="Number" value={row.n || ""} onChange={(v) => patch(["stats", String(i), "n"], v)} />
                    <CmsInput label="Label" value={row.l || ""} onChange={(v) => patch(["stats", String(i), "l"], v)} />
                    <CmsInput label="Subtext" value={row.s || ""} onChange={(v) => patch(["stats", String(i), "s"], v)} />
                  </div>
                </div>
              );
            })}
          </CmsCard>
        )}

        {activeTab === "intro" && (
          <CmsCard>
            <CmsSectionTitle title="Intro section" badge="Two-column intro" />
            <CmsMiniPreview label="Intro">
              <div style={{ fontSize: 10, fontWeight: 700, color: "#2f80ed", textTransform: "uppercase", marginBottom: 4 }}>{String(intro.eyebrow || "")}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0f2a44", marginBottom: 8 }}>{String(intro.title || "")}</div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.55 }}>
                {((intro.paragraphs as string[]) || [])[0]?.slice(0, 160) || "First paragraph…"}
              </div>
            </CmsMiniPreview>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <CmsInput label="Eyebrow" value={String(intro.eyebrow || "")} onChange={(v) => patch(["intro", "eyebrow"], v)} />
              <CmsInput label="Badge text (image overlay)" value={String(intro.badgeText || "")} onChange={(v) => patch(["intro", "badgeText"], v)} />
            </div>
            <CmsInput label="Section title" value={String(intro.title || "")} onChange={(v) => patch(["intro", "title"], v)} />
            <div style={{ marginTop: 10 }}>
              <CmsTextarea
                label="Paragraphs (blank line between paragraphs)"
                value={((intro.paragraphs as string[]) || []).join("\n\n")}
                onChange={(v) => patch(["intro", "paragraphs"], v.split(/\n\n+/).map((s) => s.trim()).filter(Boolean))}
                rows={8}
              />
            </div>
          </CmsCard>
        )}

        {activeTab === "services" && (
          <div>
            <CmsCard>
              <CmsSectionTitle title="Services section header" badge={`${serviceItems.length} cards`} />
              <CmsMiniPreview label="Services header">
                <div style={{ fontSize: 10, fontWeight: 700, color: "#2f80ed", textTransform: "uppercase" }}>{String(services.eyebrow || "")}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#0f2a44" }}>{String(services.title || "")}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{String(services.subtitle || "")}</div>
              </CmsMiniPreview>
              <SectionHeaderFields
                eyebrow={String(services.eyebrow || "")}
                title={String(services.title || "")}
                subtitle={String(services.subtitle || "")}
                onEyebrow={(v) => patch(["services", "eyebrow"], v)}
                onTitle={(v) => patch(["services", "title"], v)}
                onSubtitle={(v) => patch(["services", "subtitle"], v)}
                subtitleRows={3}
              />
            </CmsCard>
            {serviceItems.map((item, i) => {
              const row = item as Record<string, string>;
              return (
                <CmsCard key={i}>
                  <CmsSectionTitle title={`Service card ${i + 1}`} badge={row.meta || ""} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
                    <CmsInput label="Title" value={row.title || ""} onChange={(v) => patch(["services", "items", String(i), "title"], v)} />
                    <CmsInput label="Meta / pricing line" value={row.meta || ""} onChange={(v) => patch(["services", "items", String(i), "meta"], v)} />
                  </div>
                  <CmsTextarea label="Description" value={row.desc || ""} onChange={(v) => patch(["services", "items", String(i), "desc"], v)} rows={3} />
                </CmsCard>
              );
            })}
          </div>
        )}

        {activeTab === "process" && (
          <div>
            <CmsCard>
              <CmsSectionTitle title="Process section" badge={`${processSteps.length} steps`} />
              <SectionHeaderFields
                eyebrow={String(process.eyebrow || "")}
                title={String(process.title || "")}
                subtitle={String(process.subtitle || "")}
                onEyebrow={(v) => patch(["process", "eyebrow"], v)}
                onTitle={(v) => patch(["process", "title"], v)}
                onSubtitle={(v) => patch(["process", "subtitle"], v)}
              />
            </CmsCard>
            {processSteps.map((item, i) => {
              const row = item as Record<string, string>;
              return (
                <CmsCard key={i}>
                  <CmsSectionTitle title={`Step ${i + 1}`} badge={row.n || ""} />
                  <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 10 }}>
                    <CmsInput label="Step no." value={row.n || ""} onChange={(v) => patch(["process", "steps", String(i), "n"], v)} />
                    <CmsInput label="Title" value={row.title || ""} onChange={(v) => patch(["process", "steps", String(i), "title"], v)} />
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <CmsTextarea label="Description" value={row.desc || ""} onChange={(v) => patch(["process", "steps", String(i), "desc"], v)} rows={3} />
                  </div>
                </CmsCard>
              );
            })}
          </div>
        )}

        {activeTab === "pricing" && (
          <div>
            <CmsCard>
              <CmsSectionTitle title="Pricing section" badge={`${pricingPackages.length} packages`} />
              <SectionHeaderFields
                eyebrow={String(pricing.eyebrow || "")}
                title={String(pricing.title || "")}
                subtitle={String(pricing.subtitle || "")}
                onEyebrow={(v) => patch(["pricing", "eyebrow"], v)}
                onTitle={(v) => patch(["pricing", "title"], v)}
                onSubtitle={(v) => patch(["pricing", "subtitle"], v)}
              />
            </CmsCard>
            {pricingPackages.map((item, i) => {
              const row = item as Record<string, unknown>;
              const features = Array.isArray(row.features) ? (row.features as string[]) : [];
              return (
                <CmsCard key={i}>
                  <CmsMiniPreview label={`Package ${i + 1}`}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>{String(row.name || "")}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#0f2a44" }}>{String(row.amount || "")}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{String(row.from || "")}</div>
                      </div>
                      {row.popular ? (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: "#2f80ed", padding: "3px 8px", borderRadius: 20 }}>Most Popular</span>
                      ) : null}
                    </div>
                  </CmsMiniPreview>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 8 }}>
                    <CmsInput label="Package name" value={String(row.name || "")} onChange={(v) => patch(["pricing", "packages", String(i), "name"], v)} />
                    <CmsInput label="Amount" value={String(row.amount || "")} onChange={(v) => patch(["pricing", "packages", String(i), "amount"], v)} />
                    <CmsInput label="From line" value={String(row.from || "")} onChange={(v) => patch(["pricing", "packages", String(i), "from"], v)} />
                  </div>
                  <CmsToggle label="Most popular package" checked={!!row.popular} onChange={(v) => patch(["pricing", "packages", String(i), "popular"], v)} />
                  <div style={{ marginTop: 10 }}>
                    <CmsTextarea
                      label="Features (one per line)"
                      value={features.join("\n")}
                      onChange={(v) => patch(["pricing", "packages", String(i), "features"], v.split("\n").map((s) => s.trim()).filter(Boolean))}
                      rows={6}
                    />
                  </div>
                </CmsCard>
              );
            })}
          </div>
        )}

        {activeTab === "why" && (
          <div>
            <CmsCard>
              <SectionHeaderFields
                eyebrow={String(whyUs.eyebrow || "")}
                title={String(whyUs.title || "")}
                subtitle={String(whyUs.subtitle || "")}
                onEyebrow={(v) => patch(["whyUs", "eyebrow"], v)}
                onTitle={(v) => patch(["whyUs", "title"], v)}
                onSubtitle={(v) => patch(["whyUs", "subtitle"], v)}
              />
            </CmsCard>
            {whyItems.map((item, i) => {
              const row = item as Record<string, string>;
              return (
                <CmsCard key={i}>
                  <CmsSectionTitle title={`Pillar ${i + 1}`} />
                  <CmsInput label="Title" value={row.title || ""} onChange={(v) => patch(["whyUs", "items", String(i), "title"], v)} />
                  <div style={{ marginTop: 8 }}>
                    <CmsTextarea label="Description" value={row.desc || ""} onChange={(v) => patch(["whyUs", "items", String(i), "desc"], v)} rows={3} />
                  </div>
                </CmsCard>
              );
            })}
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            <CmsCard>
              <SectionHeaderFields
                eyebrow={String(testimonials.eyebrow || "")}
                title={String(testimonials.title || "")}
                subtitle={String(testimonials.subtitle || "")}
                onEyebrow={(v) => patch(["testimonials", "eyebrow"], v)}
                onTitle={(v) => patch(["testimonials", "title"], v)}
                onSubtitle={(v) => patch(["testimonials", "subtitle"], v)}
              />
            </CmsCard>
            {testimonialItems.map((item, i) => {
              const row = item as Record<string, string>;
              return (
                <CmsCard key={i}>
                  <CmsMiniPreview label={`Review ${i + 1}`}>
                    <div style={{ fontSize: 12, color: "#475569", fontStyle: "italic", marginBottom: 8 }}>&ldquo;{row.q?.slice(0, 120)}{(row.q?.length || 0) > 120 ? "…" : ""}&rdquo;</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0f2a44" }}>{row.name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{row.info}</div>
                  </CmsMiniPreview>
                  <CmsTextarea label="Quote" value={row.q || ""} onChange={(v) => patch(["testimonials", "items", String(i), "q"], v)} rows={4} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 10, marginTop: 8 }}>
                    <CmsInput label="Name" value={row.name || ""} onChange={(v) => patch(["testimonials", "items", String(i), "name"], v)} />
                    <CmsInput label="Info line" value={row.info || ""} onChange={(v) => patch(["testimonials", "items", String(i), "info"], v)} />
                    <CmsInput label="Initial" value={row.initial || ""} onChange={(v) => patch(["testimonials", "items", String(i), "initial"], v)} />
                  </div>
                </CmsCard>
              );
            })}
          </div>
        )}

        {activeTab === "faq" && (
          <div>
            <CmsCard>
              <SectionHeaderFields
                eyebrow={String(faq.eyebrow || "")}
                title={String(faq.title || "")}
                subtitle={String(faq.subtitle || "")}
                onEyebrow={(v) => patch(["faq", "eyebrow"], v)}
                onTitle={(v) => patch(["faq", "title"], v)}
                onSubtitle={(v) => patch(["faq", "subtitle"], v)}
              />
            </CmsCard>
            {faqItems.map((item, i) => {
              const row = item as Record<string, string>;
              return (
                <CmsCard key={i}>
                  <CmsSectionTitle title={`FAQ ${i + 1}`} />
                  <CmsInput label="Question" value={row.q || ""} onChange={(v) => patch(["faq", "items", String(i), "q"], v)} />
                  <div style={{ marginTop: 8 }}>
                    <CmsTextarea label="Answer" value={row.a || ""} onChange={(v) => patch(["faq", "items", String(i), "a"], v)} rows={4} />
                  </div>
                </CmsCard>
              );
            })}
            <CmsCard>
              <CmsSectionTitle title="Final CTA band" badge="Bottom of page" />
              <CmsMiniPreview label="CTA" dark>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{cta.title || ""}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{cta.subtitle || ""}</div>
              </CmsMiniPreview>
              <CmsInput label="CTA title" value={cta.title || ""} onChange={(v) => patch(["cta", "title"], v)} />
              <div style={{ marginTop: 8 }}>
                <CmsTextarea label="CTA subtitle" value={cta.subtitle || ""} onChange={(v) => patch(["cta", "subtitle"], v)} rows={3} />
              </div>
              <div style={{ marginTop: 8 }}>
                <CmsInput label="WhatsApp URL" value={cta.whatsappUrl || ""} onChange={(v) => patch(["cta", "whatsappUrl"], v)} />
              </div>
            </CmsCard>
          </div>
        )}
      </div>

      <CmsStickyFooter dirty={dirty} isSaving={saving} onSaveDraft={() => void saveDraft()} onPublish={() => void publishLive()} />
      <CmsToast message={toastMsg} visible={toastVisible} />
    </>
  );
}

export default withAdminLayout(VikarabadLandingCmsPage);
