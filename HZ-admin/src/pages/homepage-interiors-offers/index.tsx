import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import withAdminLayout from "@/src/common/AdminLayout";
import apiClient from "@/src/utils/apiClient";
import { uploadFile } from "@/src/utils/uploadFile";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";

export type OfferSlideRow = {
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
};

const CMS_KEY = "home_interiors_offers";

const DEFAULT_SLIDES: OfferSlideRow[] = [
  {
    imageUrl:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80",
    title: "Monsoon interior packages",
    subtitle: "Save up to 15% on full-home packages booked this month. Fixed price from day one.",
    ctaLabel: "Explore packages",
    ctaHref: "/pricing",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80",
    title: "Free 3D design before you commit",
    subtitle: "See every room in photorealistic renders. Revisions included — then a locked BOQ.",
    ctaLabel: "Design ideas",
    ctaHref: "/design-ideas",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=80",
    title: "45-day delivery · LiveBuild tracking",
    subtitle: "Daily site photos, milestone payments, and a 10-year workmanship warranty on Houznext interiors.",
    ctaLabel: "How it works",
    ctaHref: "/#process",
  },
];

function normalizeLoaded(raw: unknown): OfferSlideRow[] {
  const list =
    raw &&
    typeof raw === "object" &&
    Array.isArray((raw as { slides?: unknown }).slides)
      ? (raw as { slides: unknown[] }).slides
      : [];
  const out: OfferSlideRow[] = [];
  for (let i = 0; i < 3; i++) {
    const d = DEFAULT_SLIDES[i];
    const src = list[i] && typeof list[i] === "object" ? (list[i] as Record<string, unknown>) : {};
    out.push({
      imageUrl:
        typeof src.imageUrl === "string" && src.imageUrl.trim() ? src.imageUrl.trim() : d.imageUrl,
      title: typeof src.title === "string" && src.title.trim() ? src.title.trim() : d.title,
      subtitle: typeof src.subtitle === "string" && src.subtitle.trim() ? src.subtitle.trim() : d.subtitle,
      ctaLabel:
        typeof src.ctaLabel === "string" && src.ctaLabel.trim() ? src.ctaLabel.trim() : d.ctaLabel,
      ctaHref: typeof src.ctaHref === "string" && src.ctaHref.trim() ? src.ctaHref.trim() : d.ctaHref,
    });
  }
  return out;
}

function StrokeIcon({ path, stroke = "#fff", size = 16 }: { path: string; stroke?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

function HomepageInteriorsOffersCms() {
  const router = useRouter();
  const { status } = useSession();
  const [slides, setSlides] = useState<OfferSlideRow[]>(DEFAULT_SLIDES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [uploadIdx, setUploadIdx] = useState<number | null>(null);
  const fileRef0 = useRef<HTMLInputElement>(null);
  const fileRef1 = useRef<HTMLInputElement>(null);
  const fileRef2 = useRef<HTMLInputElement>(null);
  const fileRefs = [fileRef0, fileRef1, fileRef2];

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT || "http://localhost:4000").replace(
    /\/$/,
    "",
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/site-cms/${CMS_KEY}`);
      const json = (await res.json()) as { data?: unknown };
      setSlides(normalizeLoaded(json?.data));
    } catch {
      setSlides(DEFAULT_SLIDES);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    void load();
  }, [load]);

  const update = (index: number, field: keyof OfferSlideRow, value: string) => {
    setSlides((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await apiClient.post(
        `${apiBase}/site-cms/upsert`,
        { key: CMS_KEY, data: JSON.stringify({ slides }) },
        true,
      );
      setDirty(false);
      toast.success("Published! Homepage banner updates within ~60s (ISR).");
    } catch {
      toast.error("Save failed. Check login and API.");
    }
    setSaving(false);
  };

  const onPickFile = (index: number) => {
    fileRefs[index]?.current?.click();
  };

  const onFile = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setUploadIdx(index);
    try {
      const url = await uploadFile(file, "cms/home-interiors-offers", undefined, undefined, () => {});
      if (url) {
        update(index, "imageUrl", url);
        toast.success("Image uploaded");
      }
    } finally {
      setUploadIdx(null);
      if (fileRefs[index].current) fileRefs[index].current!.value = "";
    }
  };

  const siteBase = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_WEBSITE_URL?.replace(/\/$/, "")) || "";
  const previewPath = siteBase ? `${siteBase}/` : "/";

  if (status === "loading")
    return (
      <div className="flex h-64 items-center justify-center">
        <CircularProgress size={28} sx={{ color: "#2f80ed" }} />
      </div>
    );
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") void router.replace("/login");
    return null;
  }

  return (
    <Box sx={{ p: 2, fontFamily: "Inter, system-ui, sans-serif", background: "#f8fafc", minHeight: "100%" }}>
      <Box
        sx={{
          background: "#0f2a44",
          borderRadius: "12px",
          p: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <StrokeIcon path="M12 3l1.912 5.813a2 2 0 001.896 1.396l6.092.444-4.667 3.392a2 2 0 00-.728 2.233l1.79 5.52-4.813-3.497a2 2 0 00-2.352 0l-4.813 3.497 1.79-5.52a2 2 0 00-.728-2.233L2.1 11.653l6.092-.444a2 2 0 001.896-1.396L12 3z" />
          <Typography sx={{ color: "#fff", fontSize: 15, fontWeight: 800 }}>Homepage · Interiors offers</Typography>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.7,
              px: 1.2,
              py: 0.4,
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              background: "rgba(22,163,74,.15)",
              color: "#86efac",
              border: "1px solid rgba(34,197,94,.35)",
            }}
          >
            3 slides · matches store hero size
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button
            component="a"
            href={previewPath}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: 12,
              color: "#fff",
              border: "1.5px solid rgba(255,255,255,.2)",
              background: "rgba(255,255,255,.1)",
              borderRadius: "8px",
              px: 2,
            }}
          >
            Preview homepage
          </Button>
          <Button
            onClick={() => void save()}
            disabled={saving || !dirty}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: 12,
              color: "#fff",
              borderRadius: "8px",
              px: 2,
              background: "#2f80ed",
              "&:hover": { background: "#1a6dd6" },
              "&.Mui-disabled": { color: "rgba(255,255,255,.5)", background: "rgba(255,255,255,.12)" },
            }}
          >
            {saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Publish"}
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(3, 1fr)" }, gap: 2, mt: 2.5 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              p: 2.5,
              border: "1.5px solid #e2e8f0",
              borderRadius: "12px",
              background: "#fff",
            }}
          >
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#64748b", letterSpacing: ".08em", mb: 1.5 }}>
              SLIDE {i + 1}
            </Typography>
            <input ref={fileRefs[i]} type="file" accept="image/*" className="hidden" onChange={(e) => void onFile(i, e)} />
            <Box
              sx={{
                position: "relative",
                borderRadius: "10px",
                overflow: "hidden",
                border: "1px dashed #bfdbfe",
                background: "#f0f7ff",
                minHeight: 120,
                mb: 1.5,
              }}
            >
              {slides[i].imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={slides[i].imageUrl} alt="" style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
              ) : (
                <Box sx={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: 12 }}>
                  No image
                </Box>
              )}
              <Button
                size="small"
                variant="contained"
                disabled={uploadIdx === i}
                onClick={() => onPickFile(i)}
                sx={{ position: "absolute", bottom: 8, right: 8, textTransform: "none", fontWeight: 700, fontSize: 11 }}
              >
                {uploadIdx === i ? "Uploading…" : "Upload image"}
              </Button>
            </Box>
            <TextField
              fullWidth
              size="small"
              label="Image URL (optional override)"
              value={slides[i].imageUrl}
              onChange={(e) => update(i, "imageUrl", e.target.value)}
              sx={{ mb: 1.5 }}
            />
            <TextField
              fullWidth
              size="small"
              label="Headline"
              value={slides[i].title}
              onChange={(e) => update(i, "title", e.target.value)}
              sx={{ mb: 1.5 }}
            />
            <TextField
              fullWidth
              size="small"
              label="Subheading"
              value={slides[i].subtitle}
              onChange={(e) => update(i, "subtitle", e.target.value)}
              multiline
              minRows={3}
              sx={{ mb: 1.5 }}
            />
            <TextField
              fullWidth
              size="small"
              label="Button label"
              value={slides[i].ctaLabel}
              onChange={(e) => update(i, "ctaLabel", e.target.value)}
              sx={{ mb: 1.5 }}
            />
            <TextField
              fullWidth
              size="small"
              label="Button link"
              value={slides[i].ctaHref}
              onChange={(e) => update(i, "ctaHref", e.target.value)}
              placeholder="/pricing or https://…"
              helperText="Internal path (e.g. /interiors) or full URL."
            />
          </Box>
        ))}
      </Box>

      <Typography sx={{ mt: 2, fontSize: 12, color: "#64748b", maxWidth: 800 }}>
        Stored in <strong>site-cms</strong> as key <code style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: 4 }}>{CMS_KEY}</code>.
        Banner uses the same rounded card proportions as the Houznext Store first carousel (min-height ~220px, 16px radius).
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={32} sx={{ color: "#2f80ed" }} />
        </Box>
      )}
    </Box>
  );
}

export default withAdminLayout(HomepageInteriorsOffersCms);
