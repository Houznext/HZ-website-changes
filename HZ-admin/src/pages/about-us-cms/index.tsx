import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import withAdminLayout from "@/src/common/AdminLayout";
import apiClient from "@/src/utils/apiClient";
import { uploadFile } from "@/src/utils/uploadFile";

// ----- Types & fallback -----
interface TeamMember {
  id: string;
  name: string;
  role: string;
  city: string;
  photoUrl: string;
  visible: boolean;
}

interface StatItem {
  id: string;
  value: string;
  label: string;
}

interface TrustItem {
  id: string;
  label: string;
}

interface StorySection {
  eyebrow: string;
  heading: string;
  paragraph1: string;
  paragraph2: string;
  bullets: string;
  ctaLabel: string;
  ctaLink: string;
  imageUrl: string;
}

interface PageSettings {
  showHero: boolean;
  showStory: boolean;
  showValues: boolean;
  showProcess: boolean;
  showTeam: boolean;
  showTrust: boolean;
}

interface SeoData {
  metaTitle: string;
  metaDescription: string;
  canonical: string;
  ogImageUrl: string;
  h1: string;
  keywords: string;
}

interface AboutUsCmsData {
  story: StorySection;
  team: TeamMember[];
  stats: StatItem[];
  trust: TrustItem[];
  pageSettings: PageSettings;
  seo: SeoData;
}

const FALLBACK: AboutUsCmsData = {
  story: {
    eyebrow: "Why we exist",
    heading: "We built Houznext because home interiors in India were broken.",
    paragraph1:
      "Most homeowners in Hyderabad had the same painful experience — contractors who vanished mid-project, costs that doubled by handover, no way to know what was happening on their site.",
    paragraph2:
      "We founded Houznext to fix that. Fixed pricing from day one. Photorealistic 3D designs before a single nail is hammered. And LiveBuild — our proprietary tracking system that sends you daily site photos so you always know exactly what's happening at your home.",
    bullets:
      "Founded in Hyderabad, built for Telangana homeowners\n500+ projects delivered across 3 cities with zero cost overruns\nRERA registered · ISO 9001:2015 · 10-year workmanship warranty",
    ctaLabel: "Our process →",
    ctaLink: "/about-us#process",
    imageUrl: "",
  },
  team: [
    { id: "t1", name: "Arjun Sharma", role: "Lead Interior Designer", city: "Hyderabad", photoUrl: "", visible: true },
    { id: "t2", name: "Priya Reddy", role: "Senior Designer", city: "Hyderabad", photoUrl: "", visible: true },
    { id: "t3", name: "Mohammed Ali", role: "Project Manager", city: "Warangal", photoUrl: "", visible: true },
    { id: "t4", name: "Kavitha Nair", role: "3D Visualiser", city: "Hyderabad", photoUrl: "", visible: true },
    { id: "t5", name: "Ramesh Babu", role: "Site Supervisor", city: "Karimnagar", photoUrl: "", visible: true },
    { id: "t6", name: "Sunita Verma", role: "Customer Relations", city: "Hyderabad", photoUrl: "", visible: true },
  ],
  stats: [
    { id: "s1", value: "500+", label: "Homes delivered" },
    { id: "s2", value: "4.8★", label: "Customer rating" },
    { id: "s3", value: "45d", label: "Avg. delivery" },
    { id: "s4", value: "3+", label: "Cities active" },
    { id: "s5", value: "10yr", label: "Workmanship warranty" },
  ],
  trust: [
    { id: "tr1", label: "RERA Registered" },
    { id: "tr2", label: "ISO 9001:2015" },
    { id: "tr3", label: "4.8★ Average rating" },
    { id: "tr4", label: "45-day avg. delivery" },
    { id: "tr5", label: "Zero-cost EMI" },
  ],
  pageSettings: {
    showHero: true,
    showStory: true,
    showValues: true,
    showProcess: true,
    showTeam: true,
    showTrust: true,
  },
  seo: {
    metaTitle: "About Houznext | Interior Design Company in Hyderabad & Telangana",
    metaDescription:
      "Houznext is Telangana's leading fixed-price home interior design company. 500+ homes delivered with 45-day delivery guarantee, real-time LiveBuild tracking and 10-year warranty. Meet our team.",
    canonical: "/about-us",
    ogImageUrl: "",
    h1: "Building homes. Building trust.",
    keywords: "interior design company Hyderabad, best interior designers Telangana, home interiors Hyderabad",
  },
};

const inp =
  "w-full text-[14px] border-[1.5px] border-[#e2e8f0] rounded-lg px-3 py-2 outline-none transition-colors " +
  "hover:border-[#93c5fd] focus:border-[#2f80ed] focus:bg-[#e8f1fd] focus:shadow-[0_0_0_3px_rgba(47,128,237,0.08)]";

function PillToggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative h-[22px] w-10 flex-shrink-0 cursor-pointer rounded-[11px] border-0 p-0 transition-colors duration-200"
      style={{ background: on ? "#2f80ed" : "#e2e8f0" }}
    >
      <span
        className="absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white transition-transform duration-200"
        style={{
          left: 2,
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transform: on ? "translateX(18px)" : "translateX(0)",
        }}
      />
    </button>
  );
}

function StoryTab({
  data,
  updateStory,
  storyImgUploading,
  storyImgProgress,
  onImgClick,
  markDirty,
  storyImgRef,
  handleStoryImageUpload,
}: {
  data: AboutUsCmsData;
  updateStory: (k: keyof StorySection, v: string) => void;
  storyImgUploading: boolean;
  storyImgProgress: number;
  onImgClick: () => void;
  markDirty: () => void;
  storyImgRef: React.RefObject<HTMLInputElement | null>;
  handleStoryImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2" style={{ gap: 16 }}>
      <div
        className="rounded-xl bg-white p-4"
        style={{ border: "0.5px solid #e2e8f0", borderRadius: 12 }}
      >
        <p className="mb-3 flex items-center gap-2 text-[13px] font-bold" style={{ color: "#0f2a44" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          Why we exist — story section image
        </p>
        <input ref={storyImgRef} type="file" accept="image/*" className="hidden" onChange={handleStoryImageUpload} />
        <button
          type="button"
          onClick={onImgClick}
          className="group relative w-full cursor-pointer overflow-hidden text-left"
          style={{ height: 220, borderRadius: 10, border: "1px dashed #bfdbfe", background: "#f0f7ff" }}
        >
          {data.story.imageUrl ? (
            <>
              <img
                src={data.story.imageUrl}
                alt=""
                className="h-full w-full object-cover"
                style={{ borderRadius: 9 }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
                style={{ background: "rgba(15,42,68,0.6)" }}
              >
                <span className="flex items-center gap-2 text-[12px] font-semibold text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Change image
                </span>
              </div>
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="mt-2 text-[11px] font-bold" style={{ color: "#2f80ed" }}>
                Upload founder / office photo
              </span>
              <span className="mt-1 text-[10px]" style={{ color: "#5a6a7e" }}>
                Recommended: 700×600px · JPG/WebP
              </span>
            </div>
          )}
        </button>
        {storyImgUploading && (
          <div className="mt-2 h-1 w-full overflow-hidden rounded" style={{ background: "#e8f1fd" }}>
            <div
              className="h-full transition-[width] duration-200"
              style={{ width: `${storyImgProgress}%`, background: "#2f80ed" }}
            />
          </div>
        )}
        {data.story.imageUrl && !storyImgUploading && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded px-1.5 py-0.5 font-semibold" style={{ background: "#dcfce7", color: "#166534" }}>
              Uploaded ✓
            </span>
            <span className="break-all" style={{ color: "#5a6a7e" }}>
              {data.story.imageUrl.length > 40 ? `${data.story.imageUrl.slice(0, 40)}…` : data.story.imageUrl}
            </span>
            <button
              type="button"
              className="text-[11px] font-semibold"
              style={{ color: "#dc2626" }}
              onClick={() => {
                updateStory("imageUrl", "");
                markDirty();
              }}
            >
              Remove
            </button>
          </div>
        )}

        <div className="mt-4 space-y-2 rounded-lg p-[14px]" style={{ background: "#f5f7fa", border: "0.5px solid #e2e8f0" }}>
          {[
            { t: "Use a portrait or square photo of the founder, office, or a completed project", warn: false },
            { t: "Dark backgrounds work best — the image sits on a navy section", warn: false },
            { t: "Minimum 700×500px · Max file size 2MB · JPG or WebP", warn: false },
            { t: "Avoid stock photos — use real Houznext images for authenticity", warn: true },
          ].map((row, i) => (
            <div key={i} className="flex items-start gap-2 text-[12px]" style={{ color: "#1f2933" }}>
              {row.warn ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" className="mt-0.5 flex-shrink-0" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" className="mt-0.5 flex-shrink-0" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              )}
              <span>{row.t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white p-4" style={{ border: "0.5px solid #e2e8f0", borderRadius: 12 }}>
        <p className="mb-3 flex items-center gap-2 text-[13px] font-bold" style={{ color: "#0f2a44" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Story section content
        </p>
        <div className="flex flex-col" style={{ gap: 12 }}>
          <div>
            <label className="text-[12px] font-semibold" style={{ color: "#1f2933" }}>
              Eyebrow label
            </label>
            <input className={`${inp} mt-1`} value={data.story.eyebrow} onChange={(e) => updateStory("eyebrow", e.target.value)} />
            <p className="mt-0.5 text-[11px]" style={{ color: "#5a6a7e" }}>
              Small label above the heading
            </p>
          </div>
          <div>
            <label className="text-[12px] font-semibold" style={{ color: "#1f2933" }}>
              Section heading (H2)
            </label>
            <input className={`${inp} mt-1`} value={data.story.heading} onChange={(e) => updateStory("heading", e.target.value)} />
          </div>
          <div>
            <label className="text-[12px] font-semibold" style={{ color: "#1f2933" }}>
              Paragraph 1
            </label>
            <textarea className={`${inp} mt-1`} rows={3} value={data.story.paragraph1} onChange={(e) => updateStory("paragraph1", e.target.value)} />
          </div>
          <div>
            <label className="text-[12px] font-semibold" style={{ color: "#1f2933" }}>
              Paragraph 2
            </label>
            <textarea className={`${inp} mt-1`} rows={3} value={data.story.paragraph2} onChange={(e) => updateStory("paragraph2", e.target.value)} />
          </div>
          <div>
            <label className="text-[12px] font-semibold" style={{ color: "#1f2933" }}>
              Bullet points
            </label>
            <textarea className={`${inp} mt-1`} rows={4} value={data.story.bullets} onChange={(e) => updateStory("bullets", e.target.value)} />
            <p className="mt-0.5 text-[11px]" style={{ color: "#5a6a7e" }}>
              Each line becomes one bullet point on the page
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[12px] font-semibold" style={{ color: "#1f2933" }}>
                CTA label
              </label>
              <input className={`${inp} mt-1`} value={data.story.ctaLabel} onChange={(e) => updateStory("ctaLabel", e.target.value)} />
            </div>
            <div>
              <label className="text-[12px] font-semibold" style={{ color: "#1f2933" }}>
                CTA link
              </label>
              <input className={`${inp} mt-1`} value={data.story.ctaLink} onChange={(e) => updateStory("ctaLink", e.target.value)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamTab({
  data,
  setData,
  markDirty,
}: {
  data: AboutUsCmsData;
  setData: React.Dispatch<React.SetStateAction<AboutUsCmsData>>;
  markDirty: () => void;
}) {
  const fileInRef = useRef<Record<string, HTMLInputElement | null>>({});
  const uniqueCities = new Set(data.team.map((m) => m.city)).size;
  return (
    <div>
      <div className="mb-[18px] grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {[
          { l: "Team members", v: data.team.length },
          { l: "Visible", v: data.team.filter((m) => m.visible).length },
          { l: "Photos uploaded", v: data.team.filter((m) => m.photoUrl).length },
          { l: "Cities", v: uniqueCities },
        ].map((x) => (
          <div
            key={x.l}
            className="cursor-default rounded-[10px] border bg-white px-3.5 py-3 transition-all duration-200 hover:-translate-y-0.5"
            style={{ border: "0.5px solid #e2e8f0" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#93c5fd")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
          >
            <p className="text-[11px] font-semibold" style={{ color: "#5a6a7e" }}>
              {x.l}
            </p>
            <p className="font-head text-[22px] font-bold" style={{ color: "#0f2a44" }}>
              {x.v}
            </p>
          </div>
        ))}
      </div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-bold" style={{ color: "#0f2a44" }}>
          Team members
        </h2>
        <button
          type="button"
          onClick={() => {
            setData((d) => ({
              ...d,
              team: [
                ...d.team,
                {
                  id: crypto.randomUUID(),
                  name: "New member",
                  role: "Role",
                  city: "Hyderabad",
                  photoUrl: "",
                  visible: true,
                },
              ],
            }));
            markDirty();
          }}
          className="rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white transition-all"
          style={{ background: "#2f80ed" }}
        >
          + Add member
        </button>
      </div>
      {data.team.map((member, idx) => (
        <div
          key={member.id}
          className="mb-2.5 grid items-start gap-3 rounded-[11px] border bg-white p-3.5 transition-all duration-200 sm:grid-cols-[88px_1fr_auto] sm:gap-3.5"
          style={{ border: "0.5px solid #e2e8f0" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#93c5fd";
            e.currentTarget.style.boxShadow = "0 3px 12px rgba(47,128,237,0.07)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={(el) => {
                fileInRef.current[member.id] = el;
              }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                const t = toast.loading("Uploading…");
                try {
                  const url = await uploadFile(file, "cms/about-us/team-photos");
                  if (url) {
                    setData((d) => ({
                      ...d,
                      team: d.team.map((m) => (m.id === member.id ? { ...m, photoUrl: url } : m)),
                    }));
                    markDirty();
                    toast.success("Photo uploaded", { id: t });
                  } else {
                    toast.error("Upload failed", { id: t });
                  }
                } catch {
                  toast.error("Upload failed", { id: t });
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInRef.current[member.id]?.click()}
              className="group relative h-[88px] w-[88px] cursor-pointer overflow-hidden"
              style={{ borderRadius: 10, border: "1px dashed #bfdbfe", background: "#f0f7ff" }}
            >
              {member.photoUrl ? (
                <>
                  <img
                    src={member.photoUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ borderRadius: 8 }}
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ background: "rgba(15,42,68,0.55)" }}
                  >
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-white">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Change
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="mt-1 text-[9px] font-bold" style={{ color: "#5a6a7e" }}>
                    Photo
                  </span>
                </div>
              )}
            </button>
          </div>
          <div className="flex min-w-0 flex-col" style={{ gap: 8 }}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <input
                className={inp}
                value={member.name}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => ({ ...d, team: d.team.map((m) => (m.id === member.id ? { ...m, name: v } : m)) }));
                  markDirty();
                }}
                placeholder="Full name"
              />
              <input
                className={inp}
                value={member.role}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => ({ ...d, team: d.team.map((m) => (m.id === member.id ? { ...m, role: v } : m)) }));
                  markDirty();
                }}
                placeholder="Role / title"
              />
              <select
                className={inp}
                value={["Hyderabad", "Warangal", "Karimnagar", "Other"].includes(member.city) ? member.city : "Other"}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => ({ ...d, team: d.team.map((m) => (m.id === member.id ? { ...m, city: v } : m)) }));
                  markDirty();
                }}
              >
                {(["Hyderabad", "Warangal", "Karimnagar", "Other"] as const).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <PillToggle
                on={member.visible}
                onClick={() => {
                  setData((d) => ({
                    ...d,
                    team: d.team.map((m) => (m.id === member.id ? { ...m, visible: !m.visible } : m)),
                  }));
                  markDirty();
                }}
              />
              <span className="text-[12.5px] font-semibold" style={{ color: "#0f2a44" }}>
                {member.visible ? "Visible on page" : "Hidden"}
              </span>
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                style={{
                  background: member.photoUrl ? "#dcfce7" : "#f1f5f9",
                  color: member.photoUrl ? "#166534" : "#64748b",
                }}
              >
                {member.photoUrl ? "Photo ✓" : "No photo"}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 sm:items-end">
            <button
              type="button"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-[#e2e8f0] bg-white transition-all duration-150 hover:border-[#2f80ed] hover:bg-[#e8f1fd]"
              onClick={() => {
                if (idx <= 0) return;
                setData((d) => {
                  const t = [...d.team];
                  [t[idx - 1], t[idx]] = [t[idx], t[idx - 1]];
                  return { ...d, team: t };
                });
                markDirty();
              }}
            >
              <span className="text-[12px]">↑</span>
            </button>
            <button
              type="button"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-[#e2e8f0] bg-white transition-all duration-150 hover:border-[#2f80ed] hover:bg-[#e8f1fd]"
              onClick={() => {
                if (idx >= data.team.length - 1) return;
                setData((d) => {
                  const t = [...d.team];
                  [t[idx + 1], t[idx]] = [t[idx], t[idx + 1]];
                  return { ...d, team: t };
                });
                markDirty();
              }}
            >
              <span className="text-[12px]">↓</span>
            </button>
            <button
              type="button"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-[#e2e8f0] bg-white transition-all duration-150 hover:border-[#dc2626] hover:bg-[#fff1f2]"
              onClick={() => {
                if (typeof window !== "undefined" && window.confirm(`Delete "${member.name}"?`)) {
                  setData((d) => ({ ...d, team: d.team.filter((m) => m.id !== member.id) }));
                  markDirty();
                }
              }}
            >
              <span className="text-[12px]">🗑</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatsTab({
  data,
  setData,
  markDirty,
  updateSettings,
}: {
  data: AboutUsCmsData;
  setData: React.Dispatch<React.SetStateAction<AboutUsCmsData>>;
  markDirty: () => void;
  updateSettings: (k: keyof PageSettings, v: boolean) => void;
}) {
  const rows: { k: keyof PageSettings; l: string }[] = [
    { k: "showHero", l: "Hero section" },
    { k: "showStory", l: "Story section" },
    { k: "showValues", l: "Values section" },
    { k: "showProcess", l: "Process timeline" },
    { k: "showTeam", l: "Team section" },
    { k: "showTrust", l: "Trust strip" },
  ];
  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-white p-4" style={{ border: "0.5px solid #e2e8f0" }}>
        <p className="mb-1 flex items-center gap-2 text-[14px] font-bold" style={{ color: "#0f2a44" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="20" x2="12" y2="10" />
            <line x1="18" y1="20" x2="18" y2="4" />
            <line x1="6" y1="20" x2="6" y2="16" />
          </svg>
          Hero stat counters
        </p>
        <p className="mb-3 text-[12px]" style={{ color: "#5a6a7e" }}>
          The 5 stats shown in the hero section
        </p>
        <div className="space-y-2.5">
          {data.stats.map((s) => (
            <div
              key={s.id}
              className="grid grid-cols-1 items-center gap-2 rounded-[9px] border bg-[#f5f7fa] p-2.5 sm:grid-cols-[140px_1fr_auto]"
              style={{ border: "0.5px solid #e2e8f0" }}
            >
              <input
                className={inp + " !text-base !font-bold"}
                value={s.value}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => ({ ...d, stats: d.stats.map((x) => (x.id === s.id ? { ...x, value: v } : x)) }));
                  markDirty();
                }}
              />
              <input
                className={inp}
                value={s.label}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => ({ ...d, stats: d.stats.map((x) => (x.id === s.id ? { ...x, label: v } : x)) }));
                  markDirty();
                }}
              />
              <button
                type="button"
                className="mx-auto flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-[#e2e8f0] bg-white sm:mx-0"
                onClick={() => {
                  setData((d) => ({ ...d, stats: d.stats.filter((x) => x.id !== s.id) }));
                  markDirty();
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#dc2626";
                  e.currentTarget.style.background = "#fff1f2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.background = "white";
                }}
              >
                <span className="text-[12px]">×</span>
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-2 rounded border border-[#e2e8f0] bg-white px-2 py-1 text-[12px] font-semibold"
          onClick={() => {
            setData((d) => ({
              ...d,
              stats: [...d.stats, { id: crypto.randomUUID(), value: "0", label: "Label" }],
            }));
            markDirty();
          }}
        >
          + Add stat
        </button>
      </div>

      <div className="rounded-xl bg-white p-4" style={{ border: "0.5px solid #e2e8f0" }}>
        <p className="mb-1 flex items-center gap-2 text-[14px] font-bold" style={{ color: "#0f2a44" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Trust strip badges
        </p>
        <p className="mb-3 text-[12px]" style={{ color: "#5a6a7e" }}>
          The 5 trust items shown below the team section
        </p>
        <div className="space-y-2.5">
          {data.trust.map((t) => (
            <div
              key={t.id}
              className="grid grid-cols-1 items-center gap-2 rounded-[9px] border bg-[#f5f7fa] px-3 py-2 sm:grid-cols-[1fr_auto]"
              style={{ border: "0.5px solid #e2e8f0" }}
            >
              <input
                className={inp}
                value={t.label}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => ({ ...d, trust: d.trust.map((x) => (x.id === t.id ? { ...x, label: v } : x)) }));
                  markDirty();
                }}
              />
              <button
                type="button"
                className="mx-auto flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-[#e2e8f0] bg-white sm:mx-0"
                onClick={() => {
                  setData((d) => ({ ...d, trust: d.trust.filter((x) => x.id !== t.id) }));
                  markDirty();
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#dc2626";
                  e.currentTarget.style.background = "#fff1f2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.background = "white";
                }}
              >
                <span className="text-[12px]">×</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white p-4" style={{ border: "0.5px solid #e2e8f0" }}>
        <p className="mb-3 flex items-center gap-2 text-[14px] font-bold" style={{ color: "#0f2a44" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
          Section visibility
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.k} className="flex items-center justify-between gap-2 rounded-lg border border-[#e2e8f0] bg-[#f5f7fa] px-3 py-2">
              <span className="text-[12.5px] font-semibold" style={{ color: "#0f2a44" }}>
                {r.l}
              </span>
              <PillToggle
                on={data.pageSettings[r.k]}
                onClick={() => {
                  updateSettings(r.k, !data.pageSettings[r.k]);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SeoTab({
  data,
  updateSeo,
  markDirty,
}: {
  data: AboutUsCmsData;
  updateSeo: (k: keyof SeoData, v: string) => void;
  markDirty: () => void;
}) {
  const ogInput = useRef<HTMLInputElement>(null);
  return (
    <div className="mx-auto max-w-[680px] rounded-xl bg-white p-4" style={{ border: "0.5px solid #e2e8f0" }}>
      <p className="mb-3 flex items-center gap-2 text-[14px] font-bold" style={{ color: "#0f2a44" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        SEO
      </p>
      <div className="space-y-3">
        <div>
          <label className="text-[12px] font-semibold" style={{ color: "#1f2933" }}>
            Meta title
          </label>
          <input className={`${inp} mt-1`} value={data.seo.metaTitle} onChange={(e) => updateSeo("metaTitle", e.target.value)} />
          <p className="text-[11px]" style={{ color: "#5a6a7e" }}>
            Recommended max 60 characters
          </p>
        </div>
        <div>
          <label className="text-[12px] font-semibold" style={{ color: "#1f2933" }}>
            Canonical URL
          </label>
          <input className={`${inp} mt-1`} value={data.seo.canonical} onChange={(e) => updateSeo("canonical", e.target.value)} />
        </div>
        <div>
          <label className="text-[12px] font-semibold" style={{ color: "#1f2933" }}>
            Meta description
          </label>
          <textarea className={`${inp} mt-1`} rows={3} value={data.seo.metaDescription} onChange={(e) => updateSeo("metaDescription", e.target.value)} />
          <p className="text-[11px]" style={{ color: "#5a6a7e" }}>
            Recommended max 155 characters
          </p>
        </div>
        <div>
          <label className="text-[12px] font-semibold" style={{ color: "#1f2933" }}>
            H1 tag
          </label>
          <input className={`${inp} mt-1`} value={data.seo.h1} onChange={(e) => updateSeo("h1", e.target.value)} />
          <p className="text-[11px]" style={{ color: "#5a6a7e" }}>
            Should match the visible hero heading
          </p>
        </div>
        <div>
          <label className="text-[12px] font-semibold" style={{ color: "#1f2933" }}>
            Keywords
          </label>
          <input className={`${inp} mt-1`} value={data.seo.keywords} onChange={(e) => updateSeo("keywords", e.target.value)} />
        </div>
        <div>
          <label className="text-[12px] font-semibold" style={{ color: "#1f2933" }}>
            Open Graph image
          </label>
          <input
            ref={ogInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              const t = toast.loading("Uploading…");
              try {
                const url = await uploadFile(file, "cms/about-us/og");
                if (url) {
                  updateSeo("ogImageUrl", url);
                  markDirty();
                  toast.success("OG image uploaded", { id: t });
                } else {
                  toast.error("Upload failed", { id: t });
                }
              } catch {
                toast.error("Upload failed", { id: t });
              }
            }}
          />
          <button
            type="button"
            onClick={() => ogInput.current?.click()}
            className="mt-1 flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-dashed border-[#bfdbfe] bg-[#f0f7ff] px-3"
            style={{ minHeight: 64 }}
          >
            {data.seo.ogImageUrl ? (
              <span className="text-left text-[12px] break-all" style={{ color: "#166534" }}>
                OG image uploaded ✓ {data.seo.ogImageUrl.length > 40 ? data.seo.ogImageUrl.slice(0, 40) + "…" : data.seo.ogImageUrl}
              </span>
            ) : (
              <span className="text-[12px]" style={{ color: "#2f80ed" }}>
                Click to upload OG image
              </span>
            )}
          </button>
          {data.seo.ogImageUrl ? (
            <button
              type="button"
              className="mt-1 text-[11px] font-semibold"
              style={{ color: "#dc2626" }}
              onClick={() => {
                updateSeo("ogImageUrl", "");
                markDirty();
              }}
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AboutUsCmsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [data, setData] = useState<AboutUsCmsData>(FALLBACK);
  const [activeTab, setActiveTab] = useState<"story" | "team" | "stats" | "seo">("story");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storyImgUploading, setStoryImgUploading] = useState(false);
  const [storyImgProgress, setStoryImgProgress] = useState(0);
  const storyImgRef = useRef<HTMLInputElement>(null);
  const markDirty = useCallback(() => setIsDirty(true), []);

  const updateStory = (key: keyof StorySection, val: string) => {
    setData((d) => ({ ...d, story: { ...d.story, [key]: val } }));
    markDirty();
  };
  const updateSeo = (key: keyof SeoData, val: string) => {
    setData((d) => ({ ...d, seo: { ...d.seo, [key]: val } }));
    markDirty();
  };
  const updateSettings = (key: keyof PageSettings, val: boolean) => {
    setData((d) => ({ ...d, pageSettings: { ...d.pageSettings, [key]: val } }));
    markDirty();
  };

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT || "http://localhost:4000").replace(
    /\/$/,
    "",
  );

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/site-cms/about_us`);
        const json = (await res.json()) as { data?: unknown };
        const d = (json?.data ?? {}) as Record<string, unknown>;
        setData({
          story: d.story && typeof d.story === "object" ? { ...FALLBACK.story, ...(d.story as object) } : FALLBACK.story,
          team: Array.isArray(d.team) && d.team.length ? (d.team as TeamMember[]) : FALLBACK.team,
          stats: Array.isArray(d.stats) && d.stats.length ? (d.stats as StatItem[]) : FALLBACK.stats,
          trust: Array.isArray(d.trust) && d.trust.length ? (d.trust as TrustItem[]) : FALLBACK.trust,
          pageSettings:
            d.pageSettings && typeof d.pageSettings === "object" ? { ...FALLBACK.pageSettings, ...d.pageSettings } : FALLBACK.pageSettings,
          seo: d.seo && typeof d.seo === "object" ? { ...FALLBACK.seo, ...d.seo } : FALLBACK.seo,
        });
      } catch {
        /* keep fallback */
      }
      setIsLoading(false);
    };
    void load();
  }, [apiBase]);

  const save = async () => {
    setIsSaving(true);
    try {
      await apiClient.post(`${apiBase}/site-cms/upsert`, { key: "about_us", data: JSON.stringify(data) }, true);
      setIsDirty(false);
      toast.success("Published! About us page will update within 60 seconds.");
    } catch {
      toast.error("Save failed. Please try again.");
    }
    setIsSaving(false);
  };

  const handleStoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStoryImgUploading(true);
    setStoryImgProgress(0);
    const toastId = toast.loading("Uploading image…");
    try {
      const url = await uploadFile(file, "cms/about-us/story-image", undefined, undefined, (p) => setStoryImgProgress(p));
      if (url) {
        updateStory("imageUrl", url);
        toast.success("Image uploaded ✓", { id: toastId });
      } else {
        toast.error("Upload failed", { id: toastId });
      }
    } catch {
      toast.error("Upload failed", { id: toastId });
    }
    setStoryImgUploading(false);
    if (storyImgRef.current) storyImgRef.current.value = "";
  };

  const siteBase = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_WEBSITE_URL?.replace(/\/$/, "")) || "";
  const previewPath = siteBase ? `${siteBase}/about-us` : "/about-us";

  if (status === "loading")
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#2f80ed]" />
      </div>
    );
  if (!session) {
    if (typeof window !== "undefined") void router.replace("/login");
    return null;
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className="flex h-[54px] flex-shrink-0 items-center gap-3 border-b bg-white px-5"
        style={{ borderColor: "#e2e8f0" }}
      >
        <div>
          <h1 className="text-[15px] font-bold" style={{ color: "#0f2a44" }}>
            About us CMS
          </h1>
          <p className="text-[12px]" style={{ color: "#5a6a7e" }}>
            Manage story image, team members and page content
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ background: "#dcfce7", color: "#166534" }}
          >
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#16a34a]" />
            Live sync
          </span>
          <button
            type="button"
            onClick={() => window.open(previewPath, "_blank")}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-all hover:-translate-y-px"
            style={{ borderColor: "#e2e8f0", color: "#1f2933", background: "white" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Preview site
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white transition-all hover:-translate-y-px disabled:opacity-60"
            style={{ background: "#16a34a" }}
          >
            {isSaving && <span className="inline-block h-3 w-3 animate-spin rounded-full border-b border-white" />}
            {!isSaving && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
            Publish live
          </button>
        </div>
      </div>

      <div className="flex flex-shrink-0 bg-white" style={{ borderBottom: "1.5px solid #e2e8f0" }}>
        {(["story", "team", "stats", "seo"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`-mb-px whitespace-nowrap border-b-[2.5px] px-4 py-2.5 text-[12px] font-bold transition-all ${
              activeTab === tab
                ? "border-[#2f80ed] text-[#2f80ed]"
                : "border-transparent text-[#5a6a7e] hover:text-[#1f2933]"
            }`}
          >
            {tab === "story" ? "Story section" : tab === "team" ? "Team members" : tab === "stats" ? "Stats & trust" : "SEO"}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-b-2 border-[#2f80ed]" />
          </div>
        ) : (
          <>
            <div
              className="mb-4 flex items-start gap-3 rounded-[9px] px-[14px] py-[10px] text-[12px] leading-[1.55]"
              style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af" }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                className="mt-[1px] flex-shrink-0"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <span>
                This CMS controls the <strong>/about-us</strong> page. Changes go live after clicking <strong>Publish live</strong> — visible
                on the website within 60 seconds.
              </span>
            </div>
            {activeTab === "story" && (
              <StoryTab
                data={data}
                updateStory={updateStory}
                storyImgUploading={storyImgUploading}
                storyImgProgress={storyImgProgress}
                onImgClick={() => storyImgRef.current?.click()}
                markDirty={markDirty}
                storyImgRef={storyImgRef}
                handleStoryImageUpload={handleStoryImageUpload}
              />
            )}
            {activeTab === "team" && <TeamTab data={data} setData={setData} markDirty={markDirty} />}
            {activeTab === "stats" && <StatsTab data={data} setData={setData} markDirty={markDirty} updateSettings={updateSettings} />}
            {activeTab === "seo" && <SeoTab data={data} updateSeo={updateSeo} markDirty={markDirty} />}
          </>
        )}
      </div>

      <div
        className="flex flex-shrink-0 items-center justify-between border-t bg-white px-5 py-3"
        style={{ borderColor: "#e2e8f0" }}
      >
        <span className="flex items-center gap-1.5 text-[11.5px]" style={{ color: isDirty ? "#d97706" : "#5a6a7e" }}>
          {isDirty ? "⚠ Unsaved changes won't appear on the website" : "✓ All changes saved"}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              void save();
              toast.success("Saved as draft");
            }}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-all hover:-translate-y-px disabled:opacity-60"
            style={{ borderColor: "#e2e8f0", color: "#1f2933", background: "white" }}
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white transition-all hover:-translate-y-px disabled:opacity-60"
            style={{ background: "#16a34a" }}
          >
            {isSaving ? <span className="inline-block h-3 w-3 animate-spin rounded-full border-b border-white" /> : null}
            Publish live
          </button>
        </div>
      </div>
    </div>
  );
}

export default withAdminLayout(AboutUsCmsPage);
